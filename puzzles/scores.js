(function() {
  const puzzleId = location.pathname.split("/").pop().replace(".html", "");
  let startTime = Date.now();
  let completed = false;

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }

  function onCompleted() {
    if (completed) return;
    completed = true;
    const elapsed = Date.now() - startTime;
    const timeStr = formatTime(elapsed);
    const scores = JSON.parse(localStorage.getItem("puzzel-scores") || "{}");
    const prev = scores[puzzleId];
    const isNew = !prev;
    const isBest = isNew || elapsed < (scores[puzzleId + "_ms"] || Infinity);

    if (isBest) {
      scores[puzzleId] = timeStr;
      scores[puzzleId + "_ms"] = elapsed;
      localStorage.setItem("puzzel-scores", JSON.stringify(scores));
    }

    var banner = document.createElement("div");
    banner.style.cssText = "position:fixed;top:0;left:0;right:0;padding:0.75rem;text-align:center;z-index:200;font-weight:600;font-size:0.95rem;font-family:system-ui,sans-serif;transition:opacity 0.3s;";

    if (isBest) {
      banner.style.background = "linear-gradient(135deg,#6366f1,#818cf8)";
      banner.style.color = "#fff";
      banner.textContent = isNew
        ? "Voltooid in " + timeStr + "!"
        : "Nieuw record: " + timeStr + "! (was " + prev + ")";
    } else {
      banner.style.background = "#1e293b";
      banner.style.color = "#e2e8f0";
      banner.style.borderBottom = "1px solid #334155";
      banner.textContent = "Voltooid in " + timeStr + " (record: " + prev + ")";
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
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
