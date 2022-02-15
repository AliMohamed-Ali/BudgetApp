//Budget Controller Module
var budgetController = (function () {
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expenses.prototype.calcPercentage=function(totalinc){
        if(totalinc > 0){
            this.percentage= Math.round((this.value/totalinc)*100);
        }else{
            this.percentage = -1;
        }
    };
    Expenses.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItem[type].forEach((el) => (sum += el.value));
        data.total[type] = sum;
    };
    var data = {
        allItem: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };
    return {
        addItem: function (type, des, val) {
            var newItem, ID, length;
            length = data.allItem[type].length;
            //[1 2 3 4 6 7 8 8]

            //Create new id
            if (length !== 0) {
                ID = data.allItem[type][length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new element based into 'inc' or 'exp'
            if (type === "exp") {
                newItem = new Expenses(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            //Push into data structure
            data.allItem[type].push(newItem);
            //Return new item
            return newItem;
        },
        calculateBudget: function () {
            //total exp and income
            calculateTotal("exp");
            calculateTotal("inc");

            //budget income -exp
            data.budget = data.total.inc - data.total.exp;
            //percentage exp / income * 100
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function () {
            return {
                totalincome: data.total.inc,
                totalexp: data.total.exp,
                percentage: data.percentage,
                budget: data.budget,
            };
        },
        calculatePercentage:function(){
            data.allItem.exp.forEach(el=>el.calcPercentage(data.total.inc))
        },
        getPercentage:function(){
            var allPercentage = data.allItem.exp.map(el=>el.getPercentage());
            return allPercentage;
        },
        deleteItem: function (Id, type) {
            var ids, index;
            ids = data.allItem[type].map((el) => el.id);
            index = ids.indexOf(Id);
            if (index !== -1) {
                data.allItem[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        },
    };
})();

//UI Controller Module
var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expPercLabel:'.item__percentage',
    };
    var formateNumber = function(num,type){
        var numSplit,int , dec;
        /* 
        2000 => 2,000.00
        23451.12323 => 23,451.12 
        */
       num=Math.abs(num)
       num=num.toFixed(2) // 2000 => 2000.00
       numSplit = num.split('.')
       int = numSplit[0];
       if(int.length>3){
           int = int.substring(0,int.length-3)+','+int.substring(int.length-3); //2,000
       }

       dec = numSplit[1];
       return (type==='exp'?'-':'+')+' '+int+'.'+dec
    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },
        addItem: function (obj, type) {
            //1.Create html string with placeholder text

            //2.Replace the placeholder text with actual data

            //3.Insert Html into the Dom
            var html, element;

            if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace id,description ,value by new input
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formateNumber(obj.value,type));
            //add obj at the ed of container
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },
        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + "," + DOMstrings.inputValue
            );
            // fieldsArray = Array.prototype.slice.call(fields)//how to convert list to array
            fields.forEach((el) => (el.value = ""));
            fields[0].focus();
        },
        displayBudget: function (obj) {
            var type = obj.budget > 0 ?'inc':'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent =
                formateNumber(obj.totalincome,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent =
               formateNumber(obj.totalexp,'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        displayPercentages:function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expPercLabel);
            fields.forEach(function(el,i){
                if(percentages[i]>0){
                    el.textContent=percentages[i]+'%';
                }else{
                    el.textContent='---';
                }
            })

        },
        deleteListitem: function (selectItem) {
            document.getElementById(selectItem).remove();
        },
        getDate:function(){
            var now , month , year,option,months;
            now = new Date();
            // option = {month:'long'};
            // month=new Intl.DateTimeFormat('en-US', option).format(now)
            months=['January','February','March','April','May','June','July','August','September','October','November','December']
            month=now.getMonth();
            year = now.getFullYear();
            document.querySelector('.budget__title--month').textContent = months[month]+' '+year
        },
        changeType:function(){
            var fields=document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue+','+DOMstrings.inputType);
            fields.forEach(el=>el.classList.toggle('red-focus'))
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },
        getDOMstring: DOMstrings,
    };
})();

//Global App Controller
var controller = (function (budgetctrl, uictrl) {
    var setupAllEvent = function () {
        var DOM = uictrl.getDOMstring;
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.keyWich === 13) {
                event.preventDefault();
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',uictrl.changeType)
    };
    var updateBudget = function () {
        var budget;
        // 1.calculate the budget
        budgetctrl.calculateBudget();
        //2.Return the budget
        budget = budgetctrl.getBudget();
        // 3.display the budget to ui
        uictrl.displayBudget(budget);
    };
    var updatePercentage =function(){
        //1-Calculate the percentage 
        budgetctrl.calculatePercentage();
        //2-return the percentage 
        var percentages=budgetctrl.getPercentage();
        //3-display the percentage in ui
        uictrl.displayPercentages(percentages);
    }
    var ctrlAddItem = function () {
        var input, newItem;
        // 1.Get the input data
        input = uictrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2.Add the item to budget controller
            newItem = budgetctrl.addItem(input.type, input.description, input.value);
            // 3.Add the item to ui
            uictrl.addItem(newItem, input.type);
            //4.clear fields after finish
            uictrl.clearFields();
            //5.Calculate and update the budget
            updateBudget();
            //6.update the percentage 
            updatePercentage();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitItem, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitItem = itemID.split("-");
            type = splitItem[0];
            id = parseInt(splitItem[1]);
            //delete item from data structure
            budgetctrl.deleteItem(id, type);
            //delete item from ui
            uictrl.deleteListitem(itemID);
            //update budget
            updateBudget();
            //update the percentage 
            updatePercentage();
        }
    };
    return {
        init: function () {
            console.log("app has start");
            setupAllEvent();
            uictrl.getDate();
            uictrl.displayBudget({
                totalincome: 0,
                totalexp: 0,
                percentage: -1,
                budget: 0,
            });
        },
    };
})(budgetController, UIController);

controller.init();
