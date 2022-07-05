const minimist = require("minimist")
const fs = require("fs")
const { Table } = require("console-table-printer")
const user_input = minimist(process.argv.slice(2))

/**
 * This function accept a user_name, name, and balance.
 * Then saves those values into a list of users.
 * If the balance is not given the balance defualts to 100.
 * 
 * @param {string} user_name 
 * @param {string} name 
 * @param {number} balance 
 */
const addUser = (name, user_name, balance) => {
    // If the user_name (which is unique) does not exist create it.
    if (!userExist(user_name)) {
        const users = readUsers()

        // If the balance is not set, set it to 100.
        if (balance === undefined) {
            balance = 100
        }

        // Creating user object.
        const user = {
            "user_name": user_name,
            "name": name,
            "balance": balance,
            "transactions": [],
            "items": []
        }

        // Add to the users list.
        users.push(user)

        // Save the updated users list.
        writeUsers(users)

    } else { console.log("This username is already taken. Please choose a different one.") }
}

/**
 * Opens the user.json file and return all values.
 * 
 * @returns a list of user objects and their associated items
 */
const readUsers = () => {
    let data = fs.readFileSync("users.json")
    let users = JSON.parse(data.toString())
    return users
}

/**
 * The function takes what is passed into it and saves it to a file.
 * 
 * @param {object} users 
 */
const writeUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2))
}

/**
 * Finds if id passed into it is already in use.
 * @param {number} id 
 * @returns True if it does exist, false otherwise.
 */
const idExist = (id) => {

    // Retieve all ids available.
    // Then find where an appId in appIds is equal to the id given.
    const appIds = getIds().find(appId => appId === id)

    // If appIds is not undefined that means the id passed exists.
    return (appIds !== undefined)
}

/**
 * This function removes the user_name given and their children from the program.
 * 
 * @param {string} user_name 
 */
const deleteUser = (user_name) => {

    // Check if the user_name exists in the system
    if (userExist(user_name)) {

        // Get all users from the file
        const users = readUsers()

        // Filter the users list where none of the users users_names is the given user_name.
        const updatedUsers = users.filter((user) => user.user_name !== user_name)

        // Save the updated list of users.
        writeUsers(updatedUsers)


    } else { console.log("The username given does not exist.") }
}

/**
 * This function adds an item with a price to a user given.
 * 
 * @param {string} user_name 
 * @param {string} item_name 
 * @param {number} price 
 */
const addItem = (item_name, user_name, price) => {
    // The amount of total ids the program can have start 0 inclusive.
    const totalIds = 100

    // Ensure the user exist
    if (userExist(user_name)) {

        // Ensure that there are available ids to be used.
        // Add 1 to include the last id number. 
        // Do not continue if the length of used ids is equal 
        // to the total amount of Ids allowed .
        if (getIds().length != totalIds + 1) {

            // Get all the users.
            const users = readUsers()

            // Get a reference to the user who gets a new item.
            const user = users.find(user => user.user_name === user_name)

            // Generate a random id in the range given
            // Keep generating random ids until the id is unique.
            let id
            do {
                // Since the Math.random function generates a number between 0 and 1.
                // Multiply the number by totalIds + 1.
                // Round it down so the values are whole numbers.
                // So id is greater than totalIds and no id is lesser than 0.
                id = Math.floor(Math.random() * (totalIds + 1))
            } while (idExist(id))

            // Create the new item
            const item = {
                "id": id,
                "name": item_name,
                "price": price
            }

            // Push the new item to the user.
            // Since user is by reference it updates in the users list.
            user.items.push(item)

            // Save the updated users list
            writeUsers(users)

        } else { console.log("No available IDs left to give to item.") }
    } else { console.log("The username given does not exist.") }
}

/**
 * Calculates all ids in the program
 * 
 * @returns all used ids in the program
 */
const getIds = () => {

    // Container for all the ids
    let ids = []

    // Retieve the data that holds all ids
    users = readUsers()

    // For each user in users grab each user's ids.
    users.forEach(user => {
        user.items.forEach(item => {
            ids.push(item.id)
        });
    });

    return ids
}

/**
 * Checks if the username given to it exists
 * 
 * @param {string} user_name 
 * @returns 
 */
const userExist = (user_name) => {
    // Opens the user.json file
    const users = readUsers()

    // Searches for all users that have the name of user_name
    const remainder = users.find(user => user.user_name === user_name)

    // Returns a boolean depending on if remainder is empty or not.
    return (remainder !== undefined)
}

/**
 * Creates a string at the current time in a specific time format
 * @returns The current time in weekday month date year format
 */
const formatTime = (day) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dateObj = new Date(day)

    let weekday = weekdays[dateObj.getDay()]
    let month = months[dateObj.getMonth()]
    let date = dateObj.getDate()
    let year = dateObj.getFullYear()

    return `${weekday} ${month} ${date} ${year}`
}

/**
 * This function takes in the user_name of the buyer and the id of the item to be purchased.
 * If the all the prerequisites are true.
 * Add the purchased item to the buyer.
 * Remove the item from the seller.
 * Increment and decrement the seller's and buyer's balances respectively.
 * 
 * @param {string} user_name 
 * @param {number} item_id 
 */
const buyItem = (user_name, item_id) => {
    // The buyer must exist as a user.
    if (userExist(user_name)) {
        if (idExist(item_id)) { // The item the buyer wants to purchase must also exist.

            // Get file data.
            const users = readUsers()

            // Retrieve a reference to the buyer by the user_name.
            const buyer = users.find(user => user.user_name === user_name)

            // Retrieve a reference to the seller by the item id.
            const seller = users.find(user => user.items.find(item => item.id === item_id))

            // Retrieve the purchased item.
            const purchasedItem = seller.items.find(item => item.id === item_id)

            // The buyer cannot also be the seller.
            if (buyer.user_name !== seller.user_name) {

                // The buyer must have the money to purchase the item.
                if (buyer.balance >= purchasedItem.price) {

                    // Update the balances to reflect purchase.
                    buyer.balance -= purchasedItem.price
                    seller.balance += purchasedItem.price

                    // Remove the item selected in seller's items.
                    seller.items = seller.items.filter(item => item.id != purchasedItem.id);

                    // Add this transaction to the buyer's transactions list
                    buyer.transactions.push({
                        "itemId": purchasedItem.id,
                        "seller": seller.user_name,
                        "buyer": buyer.user_name,
                        "price": purchasedItem.price,
                        "date": new Date()
                    })

                    // Add item into buyer's items.
                    buyer.items.push(purchasedItem)

                    // Save updated users to file.
                    writeUsers(users)

                    // Thank user. 
                    console.log("Transaction successful. Thanks for your order!")

                } else { console.log("Insufficient funds!") }
            } else { console.log("You already own this item!") }
        } else { console.log("Cannot find item with id given!") }
    } else { console.log("Cannot find user with username given!") }
}

/**
 * Displays all users
 */
const viewUsers = () => {
    // Retrieve all users
    const users = readUsers()

    // Left align the table columns
    const table = new Table({
        columns: [
            { name: "user_name", alignment: "left" },
            { name: "name", alignment: "left" },
            { name: "balance", alignment: "left" },
            { name: "Items for sale", alignment: "left" }
        ]
    })

    // Create the table
    users.forEach(user => {
        table.addRow({
            "user_name": user.user_name,
            "name": user.name,
            "balance": "$" + user.balance,
            "Items for sale": user.items.length
        })
    });

    // Output table.
    table.printTable()
}

/**
 * Display all products for sale.
 */
const viewProducts = () => {
    // Retrieve all users
    const users = readUsers()

    // Left align the table columns
    const table = new Table({
        columns: [
            { name: "id", alignment: "left" },
            { name: "name", alignment: "left" },
            { name: "seller", alignment: "left" },
            { name: "price", alignment: "left" }
        ]
    })

    // Create the table
    users.forEach(user => {
        user.items.forEach(item => {
            table.addRow({
                "id": item.id,
                "name": item.name,
                "seller": user.user_name,
                "price": "$" + item.price

            })
        })
    })

    // Output table.
    table.printTable()
}

/**
 * Display all transactions.
 */
const viewTransactions = () => {
    // Retrieve all users
    const users = readUsers()

    // Left align the table columns
    const table = new Table({
        columns: [
            { name: "Item ID", alignment: "left" },
            { name: "seller", alignment: "left" },
            { name: "buyer", alignment: "left" },
            { name: "price", alignment: "left" },
            { name: "date", alignment: "left" }
        ]
    })

    // Holds the dates of transactions.
    let transactionDates = []

    // Get all the users with a transaction history.
    // If the length is greater than 0, there is some transaction history.
    // For each user retieve the date the transaction occured on.
    // And push it into a list of its own.
    users.filter(user => user.transactions.length > 0).forEach(user => {
        user.transactions.forEach(transaction => {
            transactionDates.push(transaction)
        })
    });

    // Sort the transaction list by date so the most recent purchase would be on the the bottom
    transactionDates.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Create the table from the transactionDates order
    transactionDates.forEach(transaction => {
        table.addRow({
            "Item ID": transaction.itemId,
            "seller": transaction.seller,
            "buyer": transaction.buyer,
            "price": "$" + transaction.price,
            "date": formatTime(transaction.date)
        })
    })

    // Output table.
    table.printTable()
}

// Parameters for the program.
if (user_input.addUser) {
    addUser(user_input.name, user_input.username, user_input.balance)

} else if (user_input.deleteUser) {
    deleteUser(user_input.username)

} else if (user_input.addItem) {
    addItem(user_input.name, user_input.owner, user_input.price)

} else if (user_input.buy) {
    buyItem(user_input.buyer, user_input.itemid)

} else if (user_input.view === "all") {
    console.log("--User Log--")
    viewUsers()
    console.log("--Item Log--")
    viewProducts()
    console.log("--Transaction Log--")
    viewTransactions()

} else if (user_input.view === "users") {
    viewUsers()

} else if (user_input.view === "products") {
    viewProducts()
}