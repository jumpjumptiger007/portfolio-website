(() => {
  const sampleCsv = [
    "email,name,company",
    "alice@example.com,Alice,Northstar",
    "bob@example.com,Bob,Signal Works",
  ].join("\n");
  const elements = {
    subject: document.querySelector("#subject"),
    template: document.querySelector("#template"),
    taskName: document.querySelector("#task-name"),
    csvFile: document.querySelector("#csv-file"),
    loadSample: document.querySelector("#load-sample"),
    csvMessage: document.querySelector("#csv-message"),
    recipientCount: document.querySelector("#recipient-count"),
    recipientPreview: document.querySelector("#recipient-preview"),
    moreRows: document.querySelector("#more-rows"),
    subjectPreview: document.querySelector("#subject-preview"),
    messagePreview: document.querySelector("#message-preview"),
    generateJson: document.querySelector("#generate-json"),
    taskJson: document.querySelector("#task-json"),
    copyJson: document.querySelector("#copy-json"),
    taskMessage: document.querySelector("#task-message"),
  };

  let recipients = [];

  function setMessage(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle("error", isError);
  }

  function clearTaskJson() {
    elements.taskJson.value = "";
    elements.copyJson.disabled = true;
    setMessage(elements.taskMessage, "No task JSON generated.");
  }

  function parseCsv(text) {
    if (typeof text !== "string" || text.length === 0) throw new Error("The CSV file is empty.");

    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    let afterQuote = false;

    function finishRow() {
      row.push(field);
      if (!row.every((value) => value.trim() === "")) rows.push(row);
      row = [];
      field = "";
      afterQuote = false;
    }

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];

      if (inQuotes) {
        if (character === '"') {
          if (text[index + 1] === '"') {
            field += '"';
            index += 1;
          } else {
            inQuotes = false;
            afterQuote = true;
          }
        } else if (character === "\r") {
          if (text[index + 1] !== "\n") throw new Error("Use LF or CRLF line endings in the CSV.");
          field += "\n";
          index += 1;
        } else {
          field += character;
        }
        continue;
      }

      if (afterQuote) {
        if (character === " " || character === "\t") continue;
        if (character === ",") {
          row.push(field);
          field = "";
          afterQuote = false;
          continue;
        }
        if (character === "\n" || character === "\r") {
          if (character === "\r" && text[index + 1] !== "\n") throw new Error("Use LF or CRLF line endings in the CSV.");
          finishRow();
          if (character === "\r") index += 1;
          continue;
        }
        throw new Error("Unexpected text after a quoted CSV field.");
      }

      if (character === ",") {
        row.push(field);
        field = "";
      } else if (character === "\n" || character === "\r") {
        if (character === "\r" && text[index + 1] !== "\n") throw new Error("Use LF or CRLF line endings in the CSV.");
        finishRow();
        if (character === "\r") index += 1;
      } else if (character === '"') {
        if (field !== "") throw new Error("A quote can only start an empty CSV field.");
        inQuotes = true;
      } else {
        field += character;
      }
    }

    if (inQuotes) throw new Error("A quoted CSV field was not closed.");
    if (field !== "" || row.length > 0 || afterQuote) finishRow();
    if (rows.length < 2) throw new Error("Add a header row and at least one recipient.");

    const headers = rows[0].slice();
    if (headers[0]?.startsWith("\uFEFF")) headers[0] = headers[0].slice(1);
    if (headers.some((header) => header.trim() === "")) throw new Error("Every CSV column needs a header.");
    if (new Set(headers).size !== headers.length) throw new Error("CSV column headers must be unique.");
    if (!headers.includes("email")) throw new Error('The CSV needs a column named exactly "email".');

    const parsedRecipients = [];
    let skippedRows = 0;
    rows.slice(1).forEach((values, index) => {
      if (values.length !== headers.length) {
        throw new Error("CSV row " + (index + 2) + " has " + values.length + " columns; expected " + headers.length + ".");
      }
      const recipient = Object.create(null);
      headers.forEach((header, column) => { recipient[header] = values[column]; });
      recipient.email = recipient.email.trim();
      if (recipient.email === "") {
        skippedRows += 1;
        return;
      }
      parsedRecipients.push(recipient);
    });

    if (parsedRecipients.length === 0) throw new Error('No recipient rows have a value in the "email" column.');
    return { headers, recipients: parsedRecipients, skippedRows };
  }

  function renderRecipientTable(headers, rows) {
    elements.recipientPreview.replaceChildren();
    elements.moreRows.hidden = rows.length <= 5;
    elements.moreRows.textContent = rows.length > 5 ? "+ " + (rows.length - 5) + " more rows" : "";

    if (rows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "Load sample data or choose a CSV with an email column.";
      elements.recipientPreview.append(empty);
      return;
    }

    const table = document.createElement("table");
    table.className = "recipient-table";
    table.setAttribute("aria-label", "First five recipient rows");
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = header;
      headerRow.append(cell);
    });
    head.append(headerRow);

    const body = document.createElement("tbody");
    rows.slice(0, 5).forEach((recipient) => {
      const recipientRow = document.createElement("tr");
      headers.forEach((header) => {
        const cell = document.createElement("td");
        cell.textContent = recipient[header] ?? "";
        recipientRow.append(cell);
      });
      body.append(recipientRow);
    });
    table.append(head, body);
    elements.recipientPreview.append(table);
  }

  function substituteVariables(text, recipient) {
    return text.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (placeholder, key) => (
      Object.prototype.hasOwnProperty.call(recipient, key) ? String(recipient[key]) : placeholder
    ));
  }

  function updateMessagePreview() {
    const firstRecipient = recipients[0];
    elements.subjectPreview.textContent = firstRecipient
      ? substituteVariables(elements.subject.value, firstRecipient)
      : "";
    elements.messagePreview.textContent = firstRecipient
      ? substituteVariables(elements.template.value, firstRecipient)
      : "";
  }

  function loadCsv(text, label) {
    clearTaskJson();
    try {
      const parsed = parseCsv(text);
      recipients = parsed.recipients;
      elements.generateJson.disabled = false;
      elements.recipientCount.textContent = recipients.length + (recipients.length === 1 ? " recipient" : " recipients");
      renderRecipientTable(parsed.headers, recipients);
      updateMessagePreview();
      const skipped = parsed.skippedRows ? " Skipped " + parsed.skippedRows + " row(s) with a blank email." : "";
      setMessage(elements.csvMessage, label + ": " + recipients.length + " recipients loaded." + skipped);
      return true;
    } catch (error) {
      recipients = [];
      elements.generateJson.disabled = true;
      elements.recipientCount.textContent = "No recipients";
      renderRecipientTable([], []);
      updateMessagePreview();
      setMessage(elements.csvMessage, error.message, true);
      return false;
    }
  }

  function loadSampleData() {
    elements.csvFile.value = "";
    loadCsv(sampleCsv, "Sample data");
  }

  async function handleCsvFile() {
    const file = elements.csvFile.files?.[0];
    if (!file) return;
    clearTaskJson();
    recipients = [];
    elements.generateJson.disabled = true;
    elements.recipientCount.textContent = "Reading CSV…";
    renderRecipientTable([], []);
    updateMessagePreview();
    setMessage(elements.csvMessage, "Reading the selected file in this frame.");
    try {
      const contents = await file.text();
      loadCsv(contents, "CSV file");
    } catch (_) {
      recipients = [];
      elements.generateJson.disabled = true;
      elements.recipientCount.textContent = "No recipients";
      renderRecipientTable([], []);
      updateMessagePreview();
      setMessage(elements.csvMessage, "The selected CSV file could not be read.", true);
    }
  }

  function generateTaskJson() {
    const subject = elements.subject.value.trim();
    const template = elements.template.value.trim();
    const taskName = elements.taskName.value.trim();
    if (!recipients.length) {
      setMessage(elements.taskMessage, "Load sample data or a CSV before generating JSON.", true);
      return;
    }
    if (!subject || !template || !taskName) {
      setMessage(elements.taskMessage, "Enter a task name, subject, and message template.", true);
      return;
    }

    const taskData = {
      taskName,
      subject,
      template,
      recipients,
      createdAt: new Date().toISOString(),
    };
    elements.taskJson.value = JSON.stringify(taskData, null, 2);
    elements.copyJson.disabled = false;
    setMessage(elements.taskMessage, "Task JSON prepared. No email was sent.");
  }

  async function copyTaskJson() {
    if (!elements.taskJson.value) return;
    elements.taskJson.focus();
    elements.taskJson.select();
    elements.taskJson.setSelectionRange(0, elements.taskJson.value.length);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(elements.taskJson.value);
        setMessage(elements.taskMessage, "JSON copied. No email was sent.");
        return;
      }
    } catch (_) {
      // Continue to the browser-supported selection fallback.
    }
    if (typeof document.execCommand === "function" && document.execCommand("copy")) {
      setMessage(elements.taskMessage, "JSON copied. No email was sent.");
      return;
    }
    setMessage(elements.taskMessage, "JSON is selected. Copy it manually; no email was sent.");
  }

  elements.subject.addEventListener("input", () => { clearTaskJson(); updateMessagePreview(); });
  elements.template.addEventListener("input", () => { clearTaskJson(); updateMessagePreview(); });
  elements.taskName.addEventListener("input", clearTaskJson);
  elements.csvFile.addEventListener("change", handleCsvFile);
  elements.loadSample.addEventListener("click", loadSampleData);
  elements.generateJson.addEventListener("click", generateTaskJson);
  elements.copyJson.addEventListener("click", copyTaskJson);
  loadSampleData();
})();
