const form = document.getElementById("item-form");
const input = document.getElementById("item-name");
const list = document.getElementById("item-list");
const statusEl = document.getElementById("status");

function renderItems(items) {
    list.innerHTML = "";
    if (items.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No items yet.";
        list.appendChild(empty);
        return;
    }
    for (const item of items) {
        const li = document.createElement("li");
        li.textContent = item.name + " (" + new Date(item.createdAt).toLocaleString() + ") ";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteItem(item.id));
        li.appendChild(deleteButton);

        list.appendChild(li);
    }
}

async function loadItems() {
    try {
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error("Request failed");
        renderItems(await res.json());
    } catch (err) {
        statusEl.textContent = "Could not load items.";
    }
}

async function deleteItem(id) {
    statusEl.textContent = "Deleting...";
    try {
        const res = await fetch("/api/items/" + encodeURIComponent(id), { method: "DELETE" });
        if (!res.ok) throw new Error("Request failed");
        statusEl.textContent = "";
        await loadItems();
    } catch (err) {
        statusEl.textContent = "Could not delete item.";
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) return;

    statusEl.textContent = "Adding...";
    try {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error("Request failed");
        input.value = "";
        statusEl.textContent = "";
        await loadItems();
    } catch (err) {
        statusEl.textContent = "Could not add item.";
    }
});

loadItems();
