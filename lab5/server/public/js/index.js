const completedFilter = document.getElementById("completedFilter");

const urlParams = new URLSearchParams(window.location.search);
const currentFilter = urlParams.get("completedFilter");
if (currentFilter) {
    completedFilter.querySelectorAll("option").forEach((option) => {
        if (option.value == currentFilter) {
            option.selected = "selected";
        }
    });
}

completedFilter.addEventListener(
    "change",
    ev => {
        const indexSelected = completedFilter.selectedIndex;
        const option = completedFilter.querySelectorAll('option')[indexSelected];
        window.location.href = "http://localhost:3000/?completedFilter=" + option.value;
    }
)