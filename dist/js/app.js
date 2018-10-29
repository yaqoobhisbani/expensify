/* 
  Name: Expensify
  Description: The Cost Tracker Application
  Author: Muhammad Yaqoob
*/

/* The Storage Module -------------------- */
const Store = (function() {
  return {
    getData: function() {
      let data;
      if (localStorage.getItem("data") === null) {
        data = {
          availableBudget: 0,
          totalIncome: 0,
          totalExpense: 0,
          incomeList: [],
          expenseList: [],
          currentEntry: null,
          currentSection: null
        };
      } else {
        data = JSON.parse(localStorage.getItem("data"));
      }
      return data;
    },
    saveChanges: function() {
      localStorage.setItem("data", JSON.stringify(Core.data));
    },
    clearAll: function() {
      localStorage.removeItem("data");
    }
  };
})();

/* The Core Module ----------------------- */
const Core = (function() {
  // Data Structure
  let data = Store.getData();

  // Update Overview Data
  const updateOverview = function() {
    data.availableBudget = 0;
    data.totalIncome = 0;
    data.totalExpense = 0;
    // Generate Total Income
    for (let i = 0; i < data.incomeList.length; i++) {
      data.totalIncome += data.incomeList[i].value;
    }
    // Generate Total Expense
    for (let i = 0; i < data.expenseList.length; i++) {
      data.totalExpense += data.expenseList[i].value;
    }
    // Generate Available Budget
    data.availableBudget = data.totalIncome - data.totalExpense;
  };

  // Set Current Entry
  const setCurrent = function(entry, section) {
    data.currentEntry = entry;
    data.currentSection = section;
  };

  // Reset Current Entry
  const resetCurrent = function() {
    data.currentEntry = null;
    data.currentSection = null;
  };

  // Delete All Entries
  const deleteAll = function() {
    data.availableBudget = 0;
    data.totalIncome = 0;
    data.totalExpense = 0;
    data.incomeList = [];
    data.expenseList = [];
    data.currentEntry = null;
    data.currentSection = null;
  };

  // Choosing Section Array
  const chooseSection = function(section) {
    let sectionArray;
    if (section === "income-list") {
      sectionArray = data.incomeList;
    } else if (section === "expense-list") {
      sectionArray = data.expenseList;
    }
    return sectionArray;
  };

  // Get Entry By ID
  const getEntry = function(id, section) {
    // Identifying Section Array
    const sectionArray = chooseSection(section);
    // Looping through array
    for (let i = 0; i < sectionArray.length; i++) {
      if (sectionArray[i].id === id) {
        return sectionArray[i];
      }
    }
  };

  // Adding New Entry to Core
  const addEntry = function(entry, section) {
    // Identifying Section Array
    const sectionArray = chooseSection(section);
    // Generate Entry ID
    let id;
    if (sectionArray.length > 0) {
      id = sectionArray[sectionArray.length - 1].id + 1;
    } else {
      id = 0;
    }
    // Preparing New Entry Object
    const newEntry = {
      id: id,
      description: entry.description,
      value: parseInt(entry.value)
    };
    // Adding New Entry to Array
    sectionArray.push(newEntry);
    // Updating to Overview
    updateOverview();
    return newEntry;
  };

  // Deleting Entry From Core
  const deleteEntry = function(entryID, section) {
    // Identifying Section Array
    const sectionArray = chooseSection(section);
    // Get Index of Entry in Array
    const index = sectionArray
      .map(function(entry) {
        return entry.id;
      })
      .indexOf(entryID);
    // Remove Entry
    sectionArray.splice(index, 1);
    // Update Overview Data
    updateOverview();
    // Update To Local Storage
  };

  // Update Entry From Core
  const updateEntry = function(entry) {
    // Choose Section Array
    const sectionArray = chooseSection(data.currentSection);
    // Looping through Array
    for (let i = 0; i < sectionArray.length; i++) {
      // Finding Match From Current Entry to Section Array
      if (sectionArray[i].id === data.currentEntry.id) {
        // Updating Entry
        sectionArray[i].description = entry.description;
        sectionArray[i].value = entry.value;
        // Updating Overview Data
        updateOverview();
        // Resetting Current Entry
        resetCurrent();
        // Update To Local Storage

        return sectionArray[i];
      }
    }
  };

  return {
    data,
    addEntry,
    deleteEntry,
    updateEntry,
    getEntry,
    setCurrent,
    resetCurrent,
    deleteAll
  };
})();

/* The UI Module ----------------------- */
const UI = (function() {
  const selectors = {
    availableBudget: "#available-budget",
    totalIncome: "#total-inc",
    totalExpense: "#total-exp",
    transType: ".trans-type",
    transDesc: ".trans-desc",
    transValue: ".trans-value",
    transSubmit: "#trans-submit",
    transUpdate: "#trans-update",
    transCancel: "#trans-cancel",
    transDeleteAll: "#trans-deleteAll",
    incomeList: "#income-list",
    expenseList: "#expense-list",
    editButton: ".edit-btn",
    deleteButton: ".delete-btn",
    notification: "#notification"
  };

  // Choose Sign By Section
  const getSign = function(section) {
    if (section === "income-list") {
      return (sign = "+");
    } else if (section === "expense-list") {
      return (sign = "-");
    }
  };

  // Show Single Entry to UI
  const showEntry = function(entry, section) {
    // Selecting Section to Add Entry & Choosing sign
    let sign = "";
    if (section === "income-list") {
      section = document.querySelector(selectors.incomeList);
      sign = "+";
    } else if (section === "expense-list") {
      section = document.querySelector(selectors.expenseList);
      sign = "-";
    }

    // Creating Entry Element
    const entryElement = document.createElement("div");
    entryElement.id = `item-${entry.id}`;
    entryElement.className = "item";
    entryElement.innerHTML = `
    <div class="left">
      <div class="item-desc">
        ${entry.description}
      </div>
    </div>
    <div class="right">
      <div class="item-value">
      ${sign} ${entry.value}
      </div>
      <div class="options">
        <a href="#" class="btn edit-btn">Edit</a>
        <a href="#" class="btn delete-btn">Delete</a>
      </div>
    </div>
    `;
    // Adding Element to UI
    section.appendChild(entryElement);
  };

  // Display Single Section
  const displaySection = function(entries, section) {
    entries.forEach(entry => {
      showEntry(entry, section);
    });
  };

  // Remove Notfication
  const removeNotification = function() {
    const notification = document.querySelector(selectors.notification);
    if (notification) {
      notification.remove();
    }
  };

  return {
    selectors,
    showEntry,
    displayAllEntries: function(incomeList, expenseList) {
      // Displaying All Income & Expense Entries
      displaySection(incomeList, "income-list");
      displaySection(expenseList, "expense-list");
    },
    getEntry: function() {
      const entry = {
        description: document.querySelector(selectors.transDesc).value,
        value: parseInt(document.querySelector(selectors.transValue).value)
      };
      return entry;
    },
    getSection: function() {
      const section = document.querySelector(selectors.transType).value;
      return section;
    },
    clearFields: function() {
      document.querySelector(selectors.transDesc).value = "";
      document.querySelector(selectors.transValue).value = "";
    },
    updateOverview: function(availableBudget, totalIncome, totalExpense) {
      document.querySelector(
        selectors.availableBudget
      ).textContent = availableBudget;
      document.querySelector(selectors.totalIncome).textContent = totalIncome;
      document.querySelector(selectors.totalExpense).textContent = totalExpense;
    },
    updateEntry: function(updatedEntry, section) {
      // Get All Entries of Section From UI
      let entries = document.getElementById(section).children;
      // Turning Entries into Array
      const allEntries = Array.from(entries);
      // Looping Through Array
      allEntries.forEach(entry => {
        // Getting ID of Entry
        const entryID = entry.getAttribute("id");
        // Getting Sign By Section
        const sign = getSign(section);
        // Finding and Updating Matched Entry
        if (entryID === `item-${updatedEntry.id}`) {
          document.querySelector(`#${section} #${entryID}`).innerHTML = `
          <div class="left">
            <div class="item-desc">
              ${updatedEntry.description}
            </div>
          </div>
          <div class="right">
            <div class="item-value">
              ${sign} ${updatedEntry.value}
            </div>
            <div class="options">
              <a href="#" class="btn edit-btn">Edit</a>
              <a href="#" class="btn delete-btn">Delete</a>
            </div>
          </div>
          `;
        }
      });
    },
    deleteEntry: function(id, section) {
      const entry = document.querySelector(`#${section} #item-${id}`);
      entry.remove();
    },
    enableEditState: function(entry, section) {
      document.querySelector(selectors.transType).value = section;
      document.querySelector(selectors.transDesc).value = entry.description;
      document.querySelector(selectors.transValue).value = entry.value;
      document.querySelector(selectors.transSubmit).style.display = "none";
      document.querySelector(selectors.transUpdate).style.display =
        "inline-block";
      document.querySelector(selectors.transCancel).style.display =
        "inline-block";
    },
    disableEditState: function() {
      this.clearFields();
      document.querySelector(selectors.transType).value = "income-list";
      document.querySelector(selectors.transSubmit).style.display =
        "inline-block";
      document.querySelector(selectors.transUpdate).style.display = "none";
      document.querySelector(selectors.transCancel).style.display = "none";
    },
    deleteAll: function() {
      // Reseting Overview
      document.querySelector(selectors.availableBudget).textContent = "0.0";
      document.querySelector(selectors.totalExpense).textContent = "0.0";
      document.querySelector(selectors.totalIncome).textContent = "0.0";
      // Disable Edit State if Enabled
      this.disableEditState();
      // Removing Entries from Expense and Income Lists
      document.querySelector(selectors.incomeList).innerHTML = "";
      document.querySelector(selectors.expenseList).innerHTML = "";
    },
    showNotification: function(message) {
      // Create Notification Element
      const notification = document.createElement("div");
      notification.id = "notification";
      notification.className = "show";
      // Add Message
      notification.innerHTML = `${message}`;
      // Selecting Footer
      const container = document.querySelector(".container");
      // Adding Notification Above Footer
      container.appendChild(notification);
      // Remove after 3 seconds
      setTimeout(function() {
        removeNotification();
      }, 2500);
    }
  };
})();

/* The App Module ----------------------- */
const App = (function(Store, Core, UI) {
  const loadEventListeners = function() {
    // Add Button Click Event
    document
      .querySelector(UI.selectors.transSubmit)
      .addEventListener("click", addButtonClicked);
    // Update Button Click Event
    document
      .querySelector(UI.selectors.transUpdate)
      .addEventListener("click", updateButtonClicked);
    // Edit Button Click Event
    document
      .querySelector(".transactions")
      .addEventListener("click", editButtonClicked);
    // Delete Button Click Event
    document
      .querySelector(".transactions")
      .addEventListener("click", deleteButtonClicked);
    // Delete All Button Click Event
    document
      .querySelector(UI.selectors.transDeleteAll)
      .addEventListener("click", deleteAllClicked);
    // Cancel Button Click Event
    document
      .querySelector(UI.selectors.transCancel)
      .addEventListener("click", cancelButtonClicked);
  };

  const addButtonClicked = function(e) {
    // Get Entry Section
    const section = UI.getSection();
    // Get Entry Data
    const entry = UI.getEntry();
    // Check If Inputs are empty
    if (entry.description.length > 0 && entry.value > 0) {
      // Add New Entry To Core
      const newEntry = Core.addEntry(entry, section);
      // Add New Entry To UI
      UI.showEntry(newEntry, section);
      // Clear Input Fields after Adding Entry
      UI.clearFields();
      // Update Overview Data
      UI.updateOverview(
        Core.data.availableBudget,
        Core.data.totalIncome,
        Core.data.totalExpense
      );
      // Show Notificataion
      UI.showNotification("Entry Added Successfully!");
      // Add To Store
      Store.saveChanges();
    } else {
      // Show Error
      UI.showNotification("Please don't leave fields empty..");
    }
    e.preventDefault();
  };

  const updateButtonClicked = function(e) {
    // Get New Section From UI
    const section = UI.getSection();
    // Get New Entry From UI
    const entry = UI.getEntry();
    // Update Entry Inside Core
    const updatedEntry = Core.updateEntry(entry);
    // Update Entry Inside UI
    UI.updateEntry(updatedEntry, section);
    // Update Overview Data
    UI.updateOverview(
      Core.data.availableBudget,
      Core.data.totalIncome,
      Core.data.totalExpense
    );
    // Disable Edit State
    UI.disableEditState();
    // Show Notification
    UI.showNotification("Entry Updated..");
    // Add To Store
    Store.saveChanges();
    // Prevent Default
    e.preventDefault();
  };

  const editButtonClicked = function(e) {
    if (e.target.classList.contains("edit-btn")) {
      // Get ID of Entry
      const entryID = e.target.parentElement.parentElement.parentElement.id;
      // Breaking ID into Array
      const entryIDArr = entryID.split("-");
      // Get ID
      const id = parseInt(entryIDArr[1]);
      // Get Entry Section
      const section =
        e.target.parentElement.parentElement.parentElement.parentElement.id;
      // Get Entry From Core
      const entry = Core.getEntry(id, section);
      // Set Current Entry
      Core.setCurrent(entry, section);
      // Enable Edit State to UI
      UI.enableEditState(entry, section);
    }
    // Prevent Default
    e.preventDefault();
  };

  const deleteButtonClicked = function(e) {
    if (e.target.classList.contains("delete-btn")) {
      // Get ID of entry
      const entryID = e.target.parentElement.parentElement.parentElement.id;
      // Breaking ID into Array
      const entryIDArr = entryID.split("-");
      // GET ID
      const id = parseInt(entryIDArr[1]);
      // Entry Section
      const section =
        e.target.parentElement.parentElement.parentElement.parentElement.id;
      // Delete From Core
      Core.deleteEntry(id, section);
      // Delete From UI
      UI.deleteEntry(id, section);
      // Update Overview Data
      UI.updateOverview(
        Core.data.availableBudget,
        Core.data.totalIncome,
        Core.data.totalExpense
      );
      // Show Notification
      UI.showNotification("Entry Deleled..");
      // Disable Edit State if Enable
      UI.disableEditState();
      // Add To Store
      Store.saveChanges();
      // Prevent Default
      e.preventDefault();
    }
  };

  const deleteAllClicked = function(e) {
    // Check If Entries are available
    if (Core.data.incomeList.length > 0 || Core.data.expenseList.length > 0) {
      // Delete Everything from Core
      Core.deleteAll();
      // Delete Everything from UI
      UI.deleteAll();
      UI.showNotification("All Entries deleted..");
      // Clear Store
      Store.clearAll();
      // Disable Edit State if Enabled
      UI.disableEditState();
    } else {
      // Show Entries not found
      UI.showNotification("No Entries Found To Delete..");
    }
    // Prevent Default
    e.preventDefault();
  };

  const cancelButtonClicked = function(e) {
    // Reset Current
    Core.resetCurrent();
    // Add To StoreThe
    Store.saveChanges();
    // Disable Edit State
    UI.disableEditState();
    // Prevent Default
    e.preventDefault();
  };

  return {
    init: function() {
      // Disable Edit State
      UI.disableEditState();

      if (localStorage.length > 0) {
        // Display Overview Data
        UI.updateOverview(
          Core.data.availableBudget,
          Core.data.totalIncome,
          Core.data.totalExpense
        );

        // Display Entries
        UI.displayAllEntries(Core.data.incomeList, Core.data.expenseList);
      }

      // Load Event Listeners
      loadEventListeners();
    }
  };
})(Store, Core, UI);

App.init();
