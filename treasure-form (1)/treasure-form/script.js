(() => {
  "use strict";

  const formState = {
    full_name: "",
    recent_days: "",
    invitation_choice: null,
    transport_choice: null,
    work_finish_time: null,
    preferred_meeting_time: null,
    interested_reason: null,
  };

  const pages = [...document.querySelectorAll(".page[data-page]")];
  const routeNumber = document.getElementById("route-number");
  const noButton = document.getElementById("welcome-no");
  const noPlayArea = document.getElementById("no-play-area");
  const noHint = document.getElementById("no-hint");
  let welcomeNoClicks = 0;
  let isSubmitting = false;

  const pageLabels = {
    welcome: "START",
    apology: "A NOTE",
    name: "01 / 03",
    days: "02 / 03",
    invitation: "03 / 03",
    transport: "THE PLAN",
    "pickup-time": "PICK-UP",
    "meet-time": "MEETING",
    reason: "YOUR THOUGHTS",
    "goodbye-no": "FINISH",
    "goodbye-start": "FINISH",
    complete: "COMPLETE",
  };

  function showPage(pageName) {
    const target = document.querySelector(`[data-page="${pageName}"]`);
    if (!target) {
      console.error(`Unknown page: ${pageName}`);
      return;
    }

    pages.forEach((page) => {
      const active = page === target;
      page.hidden = !active;
      page.classList.toggle("is-active", active);
    });

    routeNumber.textContent = pageLabels[pageName] || "CONTINUE";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setFieldError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = message || "";
  }

  function setStatus(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("status-error", isError);
  }

  function setSubmitting(buttonIds, submitting, label = "Submitting...") {
    buttonIds.forEach((id) => {
      const button = document.getElementById(id);
      if (!button) return;
      if (submitting) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.textContent = label;
      } else {
        button.disabled = false;
        if (button.dataset.originalText) {
          button.innerHTML = button.dataset.originalText;
          delete button.dataset.originalText;
        }
      }
    });
  }

  function showCompletion(title, message, status = "") {
    document.getElementById("complete-title").textContent = title;
    document.getElementById("complete-message").textContent = message;
    setStatus("complete-status", status);
    showPage("complete");
  }

  function getSupabaseClient() {
    if (!window.isSupabaseConfigured || !window.supabaseClient) return null;
    return window.supabaseClient;
  }

  async function saveResponse(payload) {
    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: false,
        message: "Supabase is not configured yet. Add your Project URL and publishable key in supabase-config.js before using the live form.",
      };
    }

    try {
      const { error } = await client
        .from("form_responses")
        .insert(payload);

      if (error) {
        console.error("Supabase insert error:", error);
        return {
          ok: false,
          message: `Your response could not be saved: ${error.message}`,
        };
      }

      return { ok: true, message: "Your response has been saved." };
    } catch (error) {
      console.error("Unexpected submission error:", error);
      return {
        ok: false,
        message: "Something went wrong while sending your response. Please try again.",
      };
    }
  }

  function basePayload() {
    return {
      full_name: formState.full_name,
      recent_days: formState.recent_days || null,
      invitation_choice: formState.invitation_choice,
      transport_choice: formState.transport_choice,
      work_finish_time: formState.work_finish_time,
      preferred_meeting_time: formState.preferred_meeting_time,
      interested_reason: formState.interested_reason,
    };
  }

  async function submitAndFinish(buttonIds, statusId, buttonLabel, completionTitle, completionMessage) {
    if (isSubmitting) return;
    isSubmitting = true;
    setSubmitting(buttonIds, true, buttonLabel);
    setStatus(statusId, "Sending your response...");

    const result = await saveResponse(basePayload());

    isSubmitting = false;
    setSubmitting(buttonIds, false);

    if (!result.ok) {
      setStatus(statusId, result.message, true);
      return;
    }

    showCompletion(completionTitle, completionMessage, result.message);
  }

  // Page 1: the playful No button moves twice; the third click ends this path.
  noButton.addEventListener("click", () => {
    welcomeNoClicks += 1;

    if (welcomeNoClicks >= 3) {
      showPage("goodbye-start");
      return;
    }

    const safePositions = [
      { left: "7%", top: "61%" },
      { left: "66%", top: "12%" },
    ];
    const nextPosition = safePositions[welcomeNoClicks - 1];
    noButton.style.left = nextPosition.left;
    noButton.style.top = nextPosition.top;
    noHint.textContent = welcomeNoClicks === 1
      ? "The No button seems a little shy..."
      : "One more try!";

    // Keep focus on the button after it moves so keyboard users can continue.
    noButton.focus({ preventScroll: true });
  });

  document.getElementById("welcome-proceed").addEventListener("click", () => showPage("apology"));
  document.getElementById("apology-next").addEventListener("click", () => showPage("name"));

  // Page 3: full name.
  document.getElementById("name-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("full-name").value.trim();
    if (!name) {
      setFieldError("name-error", "Please enter your full name to continue.");
      document.getElementById("full-name").focus();
      return;
    }
    setFieldError("name-error", "");
    formState.full_name = name;
    showPage("days");
  });

  // Page 4: optional response about recent days.
  document.getElementById("days-form").addEventListener("submit", (event) => {
    event.preventDefault();
    formState.recent_days = document.getElementById("recent-days").value.trim();
    showPage("invitation");
  });

  // Page 5: invitation choices.
  document.getElementById("invite-yes").addEventListener("click", () => {
    formState.invitation_choice = "yes";
    showPage("transport");
  });

  document.getElementById("invite-interested").addEventListener("click", () => {
    formState.invitation_choice = "interested";
    showPage("reason");
  });

  // A first No click opens a playful confirmation. A second confirmed No ends the form.
  const noConfirmDialog = document.getElementById("no-confirm-dialog");
  const noConfirmButton = document.getElementById("no-confirm-final");
  const noConfirmCancel = document.getElementById("no-confirm-cancel");

  document.getElementById("invite-no").addEventListener("click", () => {
    if (typeof noConfirmDialog.showModal === "function") {
      noConfirmDialog.showModal();
    } else {
      // Fallback for older browsers without the dialog API.
      const confirmNo = window.confirm("Ouch... saying no that quickly? 😢 Are you sure?");
      if (confirmNo) noConfirmButton.click();
    }
  });

  noConfirmCancel.addEventListener("click", () => {
    noConfirmDialog.close();
    document.getElementById("invite-no").focus({ preventScroll: true });
  });

  noConfirmButton.addEventListener("click", async () => {
    if (isSubmitting) return;

    formState.invitation_choice = "no";
    formState.transport_choice = null;
    formState.work_finish_time = null;
    formState.preferred_meeting_time = null;
    formState.interested_reason = null;

    isSubmitting = true;
    noConfirmButton.disabled = true;
    noConfirmCancel.disabled = true;
    noConfirmButton.textContent = "Sending...";

    const result = await saveResponse(basePayload());

    isSubmitting = false;
    noConfirmButton.disabled = false;
    noConfirmCancel.disabled = false;
    noConfirmButton.textContent = "No, I'm sure";
    noConfirmDialog.close();

    showPage("goodbye-no");
    setStatus("no-status", result.message, !result.ok);
  });

  // Page 6: each transport option goes to its own page.
  document.getElementById("choose-pickup").addEventListener("click", () => {
    formState.transport_choice = "pickup";
    showPage("pickup-time");
  });

  document.getElementById("choose-meet").addEventListener("click", () => {
    formState.transport_choice = "meet_there";
    showPage("meet-time");
  });

  // Page 7A: pickup time.
  document.getElementById("pickup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const time = document.getElementById("work-finish-time").value;
    if (!time) {
      setFieldError("pickup-error", "Please select the time you finish work.");
      return;
    }
    setFieldError("pickup-error", "");
    formState.work_finish_time = time;
    formState.preferred_meeting_time = null;
    await submitAndFinish(
      ["pickup-submit"],
      "pickup-status",
      "Submitting...",
      "Thank you!",
      "Thanks for letting me know your finishing time. I'll plan around it."
    );
  });

  // Page 7B: meeting time.
  document.getElementById("meet-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const time = document.getElementById("preferred-meeting-time").value;
    if (!time) {
      setFieldError("meet-error", "Please select your preferred meeting time.");
      return;
    }
    setFieldError("meet-error", "");
    formState.preferred_meeting_time = time;
    formState.work_finish_time = null;
    await submitAndFinish(
      ["meet-submit"],
      "meet-status",
      "Submitting...",
      "Thank you!",
      "Thanks for letting me know what time works for you. I'll meet you there."
    );
  });

  // Interested branch: collect the reason and submit it.
  document.getElementById("reason-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const reason = document.getElementById("interested-reason").value.trim();
    if (!reason) {
      setFieldError("reason-error", "Please share a little about your reason, if you're comfortable.");
      document.getElementById("interested-reason").focus();
      return;
    }
    setFieldError("reason-error", "");
    formState.interested_reason = reason;
    formState.transport_choice = null;
    formState.work_finish_time = null;
    formState.preferred_meeting_time = null;
    await submitAndFinish(
      ["reason-submit"],
      "reason-status",
      "Submitting...",
      "Thank you for sharing.",
      "I appreciate you taking the time to tell me how you feel."
    );
  });

  // Show a useful status if the Supabase library itself failed to load.
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.warn("Supabase CDN library did not load. The visual form can still be previewed, but submissions cannot be saved.");
  }

  // Keep this reference in the DOM for small-screen layout checks; no storage is used here.
  noPlayArea.setAttribute("aria-label", "The No button may move when pressed");
})();
