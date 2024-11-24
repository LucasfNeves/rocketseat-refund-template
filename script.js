// Importa uma função utilitária para formatar valores em BRL
import { formatCurrencyBRL } from "./utils/formatCurrencyBRL.js";

// Seleção dos elementos do DOM
const form = document.querySelector("form"); // Formulário
const valueExpense = document.getElementById("amount"); // Campo de valor
const nameOfExpense = document.getElementById("expense"); // Campo de descrição
const category = document.getElementById("category"); // Campo de categoria
const expenseList = document.querySelector("ul"); // Lista de despesas
const expensesCounter = document.getElementById("expenses-counter"); // Contador de despesas
const expensesTotal = document.querySelector("aside header h2"); // Total de despesas

// Recupera as despesas do Local Storage ou inicializa com um array vazio
const expenses =
    JSON.parse(localStorage.getItem("@refund-template-expenses")) || [];

// Função para salvar as despesas no Local Storage
const saveExpensesToLocalStorage = () => {
    localStorage.setItem("@refund-template-expenses", JSON.stringify(expenses));
};

// Função para carregar despesas do Local Storage e adicioná-las à interface
const loadExpensesFromLocalStorage = () => {
    expenses.forEach((expense) => expenseAdd(expense));
};

// Formatação automática do valor de entrada no formato BRL
valueExpense.oninput = () => {
    const value = valueExpense.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const transformToCents = Number(value) / 100; // Converte para centavos
    valueExpense.value = formatCurrencyBRL(transformToCents); // Atualiza o campo com o valor formatado
};

// Evento de submissão do formulário
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita recarregar a página

    // Criação de um objeto de despesa com informações do formulário
    const newExpense = {
        id: new Date().getTime(), // ID único baseado no timestamp atual
        expense: nameOfExpense.value, // Descrição da despesa
        category_id: category.value, // ID da categoria
        category_name: category.options[category.selectedIndex].text, // Nome da categoria
        amount: valueExpense.value, // Valor da despesa formatado
        created_at: new Date(), // Data de criação
    };

    // Adiciona a nova despesa ao array e salva no Local Storage
    expenses.push(newExpense);
    saveExpensesToLocalStorage();

    // Adiciona a despesa à interface
    expenseAdd(newExpense);
});

/**
 * Adiciona uma nova despesa à lista na interface.
 * 
 * @param {Object} newExpense - Objeto representando a nova despesa.
 * @param {number} newExpense.id - ID único da despesa.
 * @param {string} newExpense.expense - Descrição da despesa.
 * @param {string} newExpense.category_id - ID da categoria da despesa.
 * @param {string} newExpense.category_name - Nome da categoria da despesa.
 * @param {string} newExpense.amount - Valor da despesa formatado.
 * @param {Date} newExpense.created_at - Data de criação da despesa.
 */
const expenseAdd = (newExpense) => {
    try {
        // Cria o item da lista
        const expenseItem = document.createElement("li");
        expenseItem.classList.add("expense");
        expenseItem.dataset.id = newExpense.id; // Adiciona ID como atributo

        // Cria o ícone da despesa
        const expenseIcon = document.createElement("img");
        expenseIcon.setAttribute("src", `img/${newExpense.category_id}.svg`);
        expenseIcon.setAttribute("alt", `Ícone de tipo da ${newExpense.category_name}`);

        // Cria o contêiner de informações da despesa
        const expenseInfo = document.createElement("div");
        expenseInfo.classList.add("expense-info");

        // Adiciona descrição e categoria
        const expenseInfoDescription = document.createElement("strong");
        expenseInfoDescription.textContent = newExpense.expense;

        const expenseInfoCategory = document.createElement("span");
        expenseInfoCategory.textContent = newExpense.category_name;

        expenseInfo.append(expenseInfoDescription, expenseInfoCategory);

        // Adiciona o valor da despesa
        const expenseAmount = document.createElement("span");
        expenseAmount.classList.add("expense-amount");
        expenseAmount.innerHTML = `<small>R$</small>${newExpense.amount.toUpperCase().replace("R$", "")}`;

        // Cria o botão de remover
        const removeIcon = document.createElement("img");
        removeIcon.setAttribute("src", "./img/remove.svg");
        removeIcon.setAttribute("alt", "remover");
        removeIcon.classList.add("remove-icon");

        // Adiciona os elementos ao item da lista
        expenseItem.append(expenseIcon, expenseInfo, expenseAmount, removeIcon);

        // Adiciona o item à lista
        expenseList.appendChild(expenseItem);

        // Atualiza os totais e limpa o formulário
        updateQuantity();
        formClear();
    } catch (error) {
        alert("Não foi possível atualizar a lista de despesas");
        console.error(error);
    }
};

// Função para atualizar o total de despesas
const updateTotal = (items) => {
    let total = 0;

    for (let i = 0; i < items.length; i++) {
        const itemAmount = items[i].querySelector(".expense-amount");

        let value = itemAmount.textContent
            .replace(/[^\d,]/g, "") // Remove tudo, exceto números e vírgulas
            .replace(/,/g, "."); // Substitui vírgulas por pontos

        value = parseFloat(value);

        if (isNaN(value)) {
            return alert("Não foi possível calcular o total, o valor não parece ser um número");
        }

        total += Number(value);
    }

    expensesTotal.innerHTML = `<small>R$</small>${formatCurrencyBRL(total).toUpperCase().replace("R$", "")}`;
};

// Função para atualizar a quantidade de itens
const updateQuantity = () => {
    try {
        const items = expenseList.children; // Recupera todos os itens da lista
        const itensCounter = items.length; // Conta o número de itens

        expensesCounter.textContent = `${itensCounter} ${itensCounter > 1 ? "despesas" : "despesa"}`;
        updateTotal(items);
    } catch (error) {
        console.error(error);
        alert("Não foi possível atualizar os totais");
    }
};

// Evento para remover despesas ao clicar no ícone de remoção
expenseList.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-icon")) {
        const item = event.target.closest(".expense");
        const expenseId = Number(item.dataset.id); // Recupera o ID do item

        item.remove(); // Remove do DOM

        // Atualiza o array global e o Local Storage
        const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId);
        expenses.length = 0; // Limpa o array original
        expenses.push(...updatedExpenses);
        saveExpensesToLocalStorage();

        // Atualiza os totais e contadores
        updateQuantity();
    }
});

// Função para limpar o formulário após submissão
function formClear() {
    valueExpense.value = "";
    nameOfExpense.value = "";
    category.value = "";

    nameOfExpense.focus()
}

// Carrega as despesas ao iniciar
loadExpensesFromLocalStorage();
