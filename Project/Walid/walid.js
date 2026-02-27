// ===== Hamburger menu =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    main.classList.toggle("shift");
});

// ===== Plekken aanpassen =====
document.querySelectorAll("table tr").forEach(row => {

    const minusBtn = row.querySelector(".minus");
    const plusBtn = row.querySelector(".plus");
    const availableCell = row.querySelector(".available");
    const totalCell = row.querySelector(".total");

    if (!minusBtn || !plusBtn) return;

    minusBtn.addEventListener("click", () => {
        let available = parseInt(availableCell.textContent);
        if (available > 0) {
            availableCell.textContent = available - 1;
        }
    });

    plusBtn.addEventListener("click", () => {
        let available = parseInt(availableCell.textContent);
        let total = parseInt(totalCell.textContent);

        if (available < total) {
            availableCell.textContent = available + 1;
        }
    });

});