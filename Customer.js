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

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

});


function start() {
    //Display store items , id ,and price//

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log("Item ID: " + res[i].item_id + " | " + "Product Name: " + res[i].product_name + " | " + "Price : " + res[i].price)
        }
    });

    // prompt for info about the item being put up for auction
    inquirer
        .prompt([
            {
                name: "itemid",
                type: "input",
                message: "Please enter the ID of the Product to buy.",

                // validate input is number from 1-10
                validate: function (value) {
                    if (!isNaN(value) && (value > 0 && value <= 10)) {
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

                // validate input is number from 1-10
                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    } else {
                        console.log('   Please enter a valid number!');
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
            // console.log(res[itemSelected].price);
            var totalPrice = parseFloat(((res[itemSelected].price) * quantSelected).toFixed(2));

            //check if in stock is sufficent to fill order//
            if (res[itemSelected].stock_quantity >= quantSelected) {

                //update database and fill the order //

                connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: (res[itemSelected].stock_quantity - quantSelected) }, { item_id: answer.itemid }],
                    function (err, result) {
                        if (err) throw err;
                        console.log("Your order has been filled. Your total purchase amount is $" + totalPrice);

                    });

            } else {
                console.log("Insufficent stock available!");
            }

            //ask if customer wants another item//
            anotherPurchase();
        });

}

function anotherPurchase() {
    inquirer
        .prompt([
            {
                name: "purchase",
                type: "yesorno",
                message: "Would you like to purchase another item?"
            }
        ]).then(function (answer) {
            if (answer.yesorno) {
                start();
            } else {
                console.log(" Have a nice day!");

            }
        });
}

//run to display items and prompt user for item and quantity
start();

















