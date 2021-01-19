App = {
  loading: false,

  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();

    await App.render();
  },

  loadAccount: async () => {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    App.account = accounts[0];
  },

  loadContract: async () => {
    const todoListContract = await $.getJSON("TodoList.json");
    App.contracts.TodoList = TruffleContract(todoListContract);
    App.contracts.TodoList.setProvider(App.web3Provider);

    App.todoList = await App.contracts.TodoList.deployed();
  },

  render: async () => {
    // Prevent double-rendering
    if (App.loading) return;

    // UI/UX purposes
    App.setLoading(true);

    $("#account").html(App.account);
    await App.renderTasks();

    App.setLoading(false);
  },

  renderTasks: async () => {
    const $taskTemplate = $(".taskTemplate");
    const taskCount = await App.todoList.taskCount();

    for (let i = 1; i <= taskCount.length; i++) {
      const { id, content, completed } = await App.todoList.tasks(i);
      console.log(id, content, completed);

      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate
        .find(".content")
        .html(content)
        .find("input")
        .prop("name", id.toNumber())
        .prop("checked", completed);
      // .prop("click", App.toggleComplete);

      if (!completed) {
        $("#taskList").append($newTaskTemplate);
      } else {
        $("#completedTaskList").append($newTaskTemplate);
      }
      $newTaskTemplate.show();
    }
  },

  setLoading: (state) => {
    App.loading = state;
    const loader = $("#loader");
    const content = $("#content");

    if (state) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },

  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
