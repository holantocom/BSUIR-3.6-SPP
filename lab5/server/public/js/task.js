const form = document.forms.namedItem("taskForm");
const deleteButton = document.getElementById("deleteButton");
const fileInput = document.getElementById("attachedFile");

form.addEventListener(
    "submit",
    ev => {
        ev.preventDefault();
        const data = new FormData(form);

        if (window.location.href == "http://localhost:3000/task")
        {
            fetch("http://localhost:3000/task", {
                method: "post",
                body: data
            })
            .then(res => res.blob())
            .then(res => {
                window.location.href = "/";
            });
        }
        else {
            fetch(window.location.href, {
                method: "put",
                body: data
            })
            .then(res => res.blob())
            .then(res => {
                window.location.href = "/";
            });
        }
    }
)

if (deleteButton) {
    deleteButton.addEventListener(
        "click",
        ev => {
            fetch(window.location.href, {
                method: "delete"
            })
            .then(res => res.blob())
            .then(res => {
                window.location.href = "/";
            });
        }
    )
}

fileInput.addEventListener(
    "change",
    ev => {
        const fileLable = document.getElementById("fileLabel");
        fileLable.innerHTML = fileInput.value;
    }
)