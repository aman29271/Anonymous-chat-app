class Chat {
  constructor() {
    this.socket = io.connect();
    this.init();
  }
  init() {
    const mainPage = document.getElementById("mainPage");
    const landingPage = document.getElementById("landingPage");
    const overlayBtn = document.getElementById("overlayBtn");
    const info = document.getElementById("info");
    const notification = document.getElementById("notification");
    const messageInput = document.getElementById("inputText");

    var that = this;

    this.socket.on("connect", () => {
      document.getElementById("name").focus();
    });

    this.socket.on("loginSuccess", () => {
      if (info.style.display == "block") {
        info.style.display = "none";
      }
      overlayBtn.classList.add("is-loading");
      overlayBtn.textContent = "Connecting...";
    });

    this.socket.on("gotAPair", (user, otherUser) => {
      mainPage.style.display = "block";
      landingPage.style.display = "none";
      const mainUser = document.getElementById("subtitle");
      mainUser.textContent = `Welcome ${user}`;
      document.getElementById("otherUser").textContent = `Congrats. You are connected to ${otherUser}`;
    });

    this.socket.on("partnerLeft", () => {
      mainPage.style.display = "none";
      this._removeChild(document.getElementById("msgContainer"));
      landingPage.style.display = "block";
      overlayBtn.classList.remove("is-loading");
      overlayBtn.textContent = "Start";
      if (info.style.display === "none") {
        const innerHTML = `<span class="span">Your partner Left.</span>`;
        info.innerHTML = innerHTML;
        info.style.display = "block";
      }
    });

    this.socket.on("reconnect", () => {
      console.log("reconnected.");
      notification.style.display = "none";
      notification.classList.remove("is-danger");
      const div = document.querySelector("#notification div");
      div.textContent = "";
    });

    this.socket.once("connect_error", function () {
      notification.classList.add("is-danger");
      const div = document.querySelector("#notification div");
      div.textContent = `You are offline.`;
      notification.style.display = "block";
    });

    this.socket.on("system", function (userCount) {
      document.getElementById("onlineCount").textContent = `User Online: ${userCount}`;
    });

    this.socket.on("newMsg", function (user, msg) {
      that._displayNewMsg(user, msg, "left");
    });

    document.getElementById("overlayBtn").addEventListener(
      "click",
      () => {
        var nickName = document.getElementById("name").value;
        if (nickName.trim().length != 0) {
          that.socket.emit("login", nickName);
        } else {
          document.getElementById("name").focus();
        }
      },
      false
    );
    document.getElementById("close_btn").addEventListener("click", () => {
      notification.style.display = "none";
    });
    document.getElementById("name").addEventListener("keyup", loginHandler, false);
    document.getElementById("btnSend").addEventListener("click", sendMessageHander, false);
    messageInput.addEventListener("keyup", sendMessageHander, false);

    function loginHandler(e) {
      if (isNaN(Number(e.keyCode)) || e.keyCode === 13) {
        var nickName = document.getElementById("name").value;
        if (nickName.trim().length != 0) {
          that.socket.emit("login", nickName);
        }
      }
    }

    function sendMessageHander(e) {
      var msg = messageInput.value;
      if (msg.trim().length != 0) {
        if (isNaN(Number(e.keyCode)) || e.keyCode === 13) {
          messageInput.value = "";
          that.socket.emit("postMsg", msg);
          that._displayNewMsg("me", msg, "right");
        }
      }
    }
  }

  _removeChild(node) {
    [].slice.call(node.children).forEach((e) => {
      node.removeChild(e);
    });
  }

  _displayNewMsg(user, msg, direction) {
    const container = document.getElementById("msgContainer");
    let HTML = document.createElement("div");

    if (direction === "left") {
      ["has-text-left", "is-size-6", "left-aligned"].forEach((e) => HTML.classList.add(e));
      HTML.innerHTML = `<span class="span"><strong>${user}: </strong></span>
      <span class="span">${msg}</span>`;
    } else {
      ["has-text-right", "is-size-6", "right-aligned"].forEach((e) => HTML.classList.add(e));
      HTML.innerHTML = `<span class="span">${msg}</span>`;
    }
    container.appendChild(HTML);
  }
}
module.exports = Chat;
