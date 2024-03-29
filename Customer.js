var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

//gobal var to hold total number of products in database
var totalProducts =parseInt(10);

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
});

function displayInventory() {
    //Display store items , id ,and price//

    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        var inventory = "";
        for (var i = 0; i < result.length; i++) {
            inventory = "";
            inventory += "Item ID: " + result[i].item_id + " | ";
            inventory += "Product Name: " + result[i].product_name + " | ";
            inventory += "Department: " + result[i].department_name + " | ";
            inventory += "Price : " + result[i].price + "\n";

            console.log(inventory);
        }
        //prompt user function call//
        start();

    });
}

function start() {
    // prompt for info to buy//
    inquirer
        .prompt([
            {
                name: "itemid",
                type: "input",
                message: "Please enter the ID of the Product to buy.",
                filter: Number,

                // validate input is number from 1-10
                validate: function (value) {
                    if (!isNaN(value) && (value > 0 && value <= totalProducts)) {
                        return true;
                    } else {
                        console.log('   Please enter a number from 1-10');
                        return false;
                    }
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Please enter Quantity of the product to buy.",
                filter: Number,

                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    } else {
                        console.log(' Please enter a valid number!');
                        return false;
                    }
                }
            }

        ]).then(function (answer) {
            //assigning var to item, quant and total price//
            var itemSelected = (answer.itemid);
            // console.log(itemSelected);

            var quantSelected = parseInt(answer.quantity);
            // console.log(quantSelected);

            // Verifiy that id entered is in the database and is a valid id//
            connection.query("SELECT * FROM products WHERE ?", [{ item_id: itemSelected }], function (err, result) {
                if (err) throw err;
                // console.log(JSON.stringify(result));
                if (result.length === 0) {
                    console.log("Please enter a valid product ID number!");
                    displayInventory();

                } else {

                    var product = result[0];
                    // console.log(product);
                    // check to see if quantity selected is in stock and then fill order if it is//
                    if (quantSelected <= product.stock_quantity) {

                        console.log("You purchased " + quantSelected + "  " + product.product_name)
                        console.log("Your order has been filled. Your total purchase amount is $" + parseFloat(product.price * quantSelected).toFixed(2))

                        connection.query("UPDATE products SET stock_quantity = " + (product.stock_quantity - quantSelected)
                            + " WHERE item_id = " + itemSelected), function (err, result) {
                                if (err) throw err;
                            }
                    } else {
                        console.log("Insufficent stock available!");
                        
                    }
                    anotherPurchase();
                }
            })
        })
}

function anotherPurchase() {
    inquirer
        .prompt(
            {
                name: "action",
                type: "list",
                message: "Would you like to purchase another item?",
                choices: [
                    "YES",
                    "NO",
                ]
            })
        .then(function (answer) {
            switch (answer.action) {
                case "YES":
                    displayInventory();
                    break;

                case "NO":
                    console.log("Thank you for shopping at Bamazon!")
                    connection.end();
                    break;
            }
        });
}
//run to display items and prompt user for item and quantity
displayInventory();














