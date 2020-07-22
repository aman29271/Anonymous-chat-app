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
    const nextBtn = document.getElementById("next");
    const exitBtn = document.getElementById("exit");
    const navbar = document.getElementById("simpleNavbar");
    const modal = document.getElementById("modal");
    let that = this;
    let timer;
    this.socket.on("connect", () => {
      document.getElementById("name").focus();
      navbar.style.display = "none";
    });

    this.socket.on("loginSuccess", () => {
      if (info.style.display == "block") {
        info.style.display = "none";
      }
      overlayBtn.classList.add("is-loading");
      modal.classList.add("is-active");
    });

    this.socket.on("gotAPair", (user, otherUser) => {
      [modal, overlayBtn].forEach((e) => {
        e.classList.remove("is-active");
      });
      [navbar, mainPage].forEach((e) => {
        e.style.display = "block";
      });
      landingPage.style.display = "none";
      const mainUser = document.getElementById("subtitle");
      mainUser.textContent = `Welcome ${user}`;
      document.getElementById("otherUser").textContent = `Congrats. You are connected to ${otherUser}`;
      // register your timer here;
    });

    this.socket.on("partnerLeft", (msg) => {
      // clear your timer
      displayMessageOnLogin(msg);
    });

    this.socket.on("reconnect", () => {
      console.log("reconnected.");
      notification.style.display = "none";
      notification.classList.remove("is-danger");
      const div = document.querySelector("#notification div");
      div.textContent = "";
    });

    this.socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    this.socket.once("connect_error", function () {
      // pause your timer
      console.log("connect error");
      notification.classList.add("is-danger");
      const div = document.querySelector("#notification div");
      div.textContent = `No internet connection.`;
      notification.style.display = "block";
    });

    this.socket.on("system", function (userCount) {
      document.getElementById("onlineCount").textContent = `User Online: ${userCount}`;
    });

    this.socket.on("newMsg", function (user, msg) {
      that._displayNewMsg(user, msg, "left");
    });

    nextBtn.addEventListener("click", () => {
      that.socket.emit("findAnotherPair");
      modal.classList.add("is-active");
      // clear your timer
      that._removeChild(document.getElementById("msgContainer"));
    });

    exitBtn.addEventListener("click", () => {
      // clear your timer
      that.socket.emit("getMeOut");
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
    messageInput.addEventListener("input", () => {
      that.socket.emit("postMsg", { msg: "", typing: true });
    });

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
          that.socket.emit("postMsg", { msg, typing: false });
          that._displayNewMsg("me", { msg }, "right");
        }
      }
    }
    function displayMessageOnLogin(msg) {
      mainPage.style.display = "none";
      that._removeChild(document.getElementById("msgContainer"));
      landingPage.style.display = "block";
      navbar.style.display = "none";
      overlayBtn.classList.remove("is-loading");
      overlayBtn.textContent = "Start";
      if (info.style.display === "none") {
        const innerHTML = `<span class="span">${msg}</span>`;
        info.innerHTML = innerHTML;
        info.style.display = "block";
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
      let html;
      const leftMsg = document.querySelectorAll(".left-aligned");
      const leftLastChild = leftMsg[leftMsg.length - 1];
      if (msg.typing) {
        console.log(msg);
        if (leftMsg.length == 0 || leftLastChild.textContent !== `${user}: typing...`) {
          html = `<span class="span"><strong>${user}: </strong></span><span class="span">typing...</span>`;
          HTML.innerHTML = html;
          container.appendChild(HTML);
        }

      } else {
        if (leftMsg.length == 0 || leftLastChild.textContent === `${user}: typing...`) {
          // remove typing child
          container.removeChild(leftLastChild);
          html = `<span class="span"><strong>${user}: </strong></span><span class="span">${msg.msg}</span>`;
        } else {
          html = `<span class="span"><strong>${user}: </strong></span><span class="span">${msg.msg}</span>`;
        }
        HTML.innerHTML = html;
        container.appendChild(HTML);
      }
    } else {
      ["has-text-right", "is-size-6", "right-aligned"].forEach((e) => HTML.classList.add(e));
      HTML.innerHTML = `<span class="span">${msg.msg}</span>`;
      container.appendChild(HTML);
    }
  }
}
module.exports = Chat;
