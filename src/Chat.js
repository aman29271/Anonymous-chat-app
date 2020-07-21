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
      document.getElementById(
        "otherUser"
      ).textContent = `Congrats. You are connected to ${otherUser}`;
    });
    this.socket.on("partnerLeft", () => {
      mainPage.style.display = "none";
      landingPage.style.display = "block";
      overlayBtn.classList.remove("is-loading");
      overlayBtn.textContent = "Start";
      if (info.style.display === "none") {
        const innerHTML = `<span class="span">Your partner Left.</span>`;
        info.innerHTML = innerHTML;
        info.style.display = "block";
      }
    });
    this.socket.on("error", function (err) {
      console.log('error occured')
      if (document.getElementById("loginWrapper").style.display == "none") {
        document.getElementById("status").textContent = "!fail to connect :(";
      } else {
        document.getElementById("info").textContent = "!fail to connect :(";
      }
    });
    this.socket.on("system", function (userCount) {
      document.getElementById(
        "onlineCount"
      ).textContent = `User Online: ${userCount}`;
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
    document.getElementById("name").addEventListener(
      "keyup",
      function (e) {
        if (e.keyCode == 13) {
          var nickName = document.getElementById("name").value;
          if (nickName.trim().length != 0) {
            that.socket.emit("login", nickName);
          }
        }
      },
      false
    );
    document.getElementById("btnSend").addEventListener(
      "click",
      () => {
        var messageInput = document.getElementById("inputText");
        var msg = messageInput.value;
        messageInput.value = "";
        messageInput.focus();
        if (msg.trim().length != 0) {
          that.socket.emit("postMsg", msg);
          that._displayNewMsg("me", msg, "right");
          return;
        }
      },
      false
    );
    document.getElementById("inputText").addEventListener(
      "keyup",
      function (e) {
        var messageInput = document.getElementById("inputText");
        var msg = messageInput.value;
        if (e.keyCode == 13 && msg.trim().length != 0) {
          messageInput.value = "";
          that.socket.emit("postMsg", msg);
          that._displayNewMsg("me", msg, "right");
        }
      },
      false
    );
  }
  _displayNewMsg(user, msg, direction) {
    const container = document.getElementById("msgContainer");
    let HTML;
    if (direction === "left") {
      HTML = document.createElement("div");
      ["has-text-left", "is-size-6", "left-aligned"].forEach((e) =>
        HTML.classList.add(e)
      );
      HTML.innerHTML = `<span class="span"><strong>${user}: </strong></span>
      <span class="span">${msg}</span>`;
    } else {
      HTML = document.createElement("div");
      ["has-text-right", "is-size-6", "right-aligned"].forEach((e) =>
        HTML.classList.add(e)
      );
      HTML.innerHTML = `<span class="span">${msg}</span>`;
    }
    container.appendChild(HTML);
  }
}
module.exports = Chat;
