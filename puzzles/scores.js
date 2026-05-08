(function() {
  var puzzleId = location.pathname.split("/").pop().replace(".html", "");
  var startTime = Date.now();
  var completed = false;

  function getGameType() {
    var checked = document.querySelector("#gametype .tick:checked");
    if (checked) return checked.parentElement.textContent.trim();
    var items = document.querySelectorAll("#gametype li");
    for (var i = 0; i < items.length; i++) {
      var tick = items[i].querySelector(".tick");
      if (tick && tick.checked) return items[i].textContent.trim();
    }
    return "default";
  }

  function scoreKey() {
    return puzzleId + "|" + getGameType();
  }

  function saveLastType() {
    var prefs = JSON.parse(localStorage.getItem("puzzel-prefs") || "{}");
    prefs[puzzleId] = getGameType();
    localStorage.setItem("puzzel-prefs", JSON.stringify(prefs));
  }

  function restoreLastType() {
    var prefs = JSON.parse(localStorage.getItem("puzzel-prefs") || "{}");
    var lastType = prefs[puzzleId];
    if (!lastType || lastType === "default") return;

    var items = document.querySelectorAll("#gametype li");
    for (var i = 0; i < items.length; i++) {
      var label = items[i].textContent.trim();
      var tick = items[i].querySelector(".tick");
      if (label === lastType && tick && !tick.checked) {
        items[i].querySelector("button, label, [tabindex]")?.click();
        tick.click?.();
        break;
      }
    }
  }

  function formatTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m > 0 ? m + "m " + sec + "s" : sec + "s";
  }

  function getScores() {
    return JSON.parse(localStorage.getItem("puzzel-scores") || "{}");
  }

  function onCompleted() {
    if (completed) return;
    completed = true;
    var elapsed = Date.now() - startTime;
    var timeStr = formatTime(elapsed);
    var key = scoreKey();
    var type = getGameType();
    var scores = getScores();

    var prevTime = scores[key];
    var prevMs = scores[key + "_ms"];
    var isNew = !prevTime;
    var isBest = isNew || elapsed < (prevMs || Infinity);

    if (isBest) {
      scores[key] = timeStr;
      scores[key + "_ms"] = elapsed;
    }

    scores[puzzleId + "_lastType"] = type;
    scores[puzzleId + "_lastTime"] = timeStr;
    scores[puzzleId + "_lastMs"] = elapsed;
    localStorage.setItem("puzzel-scores", JSON.stringify(scores));

    saveLastType();

    var banner = document.createElement("div");
    banner.style.cssText = "position:fixed;top:0;left:0;right:0;padding:0.75rem;text-align:center;z-index:200;font-weight:600;font-size:0.95rem;font-family:system-ui,sans-serif;transition:opacity 0.3s;";

    var typeLabel = type !== "default" ? " (" + type + ")" : "";

    if (isBest) {
      banner.style.background = "linear-gradient(135deg,#6366f1,#818cf8)";
      banner.style.color = "#fff";
      banner.textContent = isNew
        ? "Voltooid in " + timeStr + "!" + typeLabel
        : "Nieuw record: " + timeStr + "!" + typeLabel + " (was " + prevTime + ")";
    } else {
      banner.style.background = "#1e293b";
      banner.style.color = "#e2e8f0";
      banner.style.borderBottom = "1px solid #334155";
      banner.textContent = "Voltooid in " + timeStr + typeLabel + " (record: " + prevTime + ")";
    }

    document.body.appendChild(banner);
    setTimeout(function() { banner.style.opacity = "0"; setTimeout(function() { banner.remove(); }, 300); }, 5000);
  }

  function watchStatusbar(el) {
    new MutationObserver(function() {
      var text = el.textContent || "";
      if (text.includes("COMPLETED!")) onCompleted();
    }).observe(el, { childList: true, characterData: true, subtree: true });
  }

  function watchGameTypeChanges() {
    var menu = document.getElementById("gametype");
    if (!menu) return;
    new MutationObserver(function() {
      startTime = Date.now();
      completed = false;
      saveLastType();
    }).observe(menu, { childList: true, subtree: true, attributes: true });
  }

  function init() {
    var statusbar = document.getElementById("statusbar");
    if (statusbar) {
      watchStatusbar(statusbar);
    } else {
      new MutationObserver(function(mutations, obs) {
        var sb = document.getElementById("statusbar");
        if (sb) {
          obs.disconnect();
          watchStatusbar(sb);
        }
      }).observe(document.body, { childList: true, subtree: true });
    }

    var newBtn = document.getElementById("new");
    var restartBtn = document.getElementById("restart");
    [newBtn, restartBtn].forEach(function(btn) {
      if (btn) btn.addEventListener("click", function() {
        startTime = Date.now();
        completed = false;
        setTimeout(saveLastType, 100);
      });
    });

    watchGameTypeChanges();

    setTimeout(function() {
      restoreLastType();
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
