import { GithubUser } from "./githubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector("#app")

        this.load()
    }

    load() {
        this.entradas = JSON.parse(localStorage.getItem("@github-favorites:")) || []
    }

    save() {
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entradas))
    }

    delete(usuario) {
        const filtrarEntradas = this.entradas.filter(dado => dado.login !== usuario.login)
        this.entradas = filtrarEntradas
        this.update()
        this.save()
    }

    async add(username) {
        try {
            const userExist = this.entradas.find(data => data.login.toLowerCase() == username)

            if (userExist) {
                throw new Error("Usuário já cadastrado")
            }

            const user = await GithubUser.search(username)
            
            if (user.login === undefined) {
                throw new Error("Usuário não encontrado!")
            }
       
            this.entradas = [user, ...this.entradas]
    
            this.update()
            this.save()
            
        } catch(error) {
            alert(error.message)
        }
        
        const cleanInput = this.root.querySelector("#input-search")
        cleanInput.value = ""
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector("tbody")

        this.update()

        this.onAdd()

        this.removeAll()
    }

    update() {
        this.removeBodyRows()

        this.entradas.forEach(usuario => {
            const row = this.createRow()
            row.querySelector(".user img").src = `https://github.com/${usuario.login}.png`
            row.querySelector(".user img").alt = `Foto de perfil de ${usuario.name}`
            row.querySelector(".user a").href = `https://github.com/${usuario.login}`
            row.querySelector(".user a p").textContent = usuario.name
            row.querySelector(".user a span").textContent = usuario.login
            row.querySelector(".repositories").textContent = usuario.public_repos
            row.querySelector(".followers").textContent = usuario.followers

            row.querySelector(".delete").onclick = () => {
                const isOk = confirm("Tem certeza que deseja remover esse usuário?")
                if (isOk) {
                    this.delete(usuario)
                }
            }

            this.tbody.append(row)
        }) 
        this.initialApprence()
    }
    
    removeBodyRows() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {tr.remove()})
    }

    createRow() {
        const newRow = document.createElement("tr")

        newRow.innerHTML = `
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Foto de perfil de Mayk Brito">
                <a href="https://github.com/maykbrito">
                    <p>Mayk Brito</p>
                    <span>maykbrito</span>
                </a>
            </td>
            <td class="repositories">76</td>
            <td class="followers">120000</td>
            <td class="action">
                <button class="delete">Remover</button>
            </td>
        `
        return newRow
    }

    onAdd() {
        const addButton = this.root.querySelector(".add")

        addButton.onclick = () => {
            const inputValue = this.root.querySelector("#input-search").value
            this.add(inputValue)
        }
    }
    
    initialApprence() {
        const initialBox = this.root.querySelector(".initial") 

        if (this.entradas.length == 0) {
            initialBox.classList.remove("hide")
        } else {
            initialBox.classList.add("hide")
        }
    }

    removeAll() {
        const removeButton = this.root.querySelector("#remove")

        removeButton.onclick = () => {
            this.tbody.querySelectorAll('tr').forEach((tr) => {tr.remove()})
            this.entradas = []
            this.initialApprence()
            localStorage.clear()
        }
    }
}