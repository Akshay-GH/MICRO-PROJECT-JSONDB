// Configuration for JPDB
var jpdbBaseUrl = "http://api.login2explore.com:5577";
var jpdbImlEndpoint = "/api/iml";
var jpdbIrlEndpoint = "/api/irl";
var jpdbToken = "90935235|-31949242719711704|90958404";
var dbName = "SCHOOL-DB";
var relName = "STUDENT-TABLE";

// Helpers to build JPDB request payloads
function createPUTRequest(connToken, jsonObj, dbName, relName) {
  var putRequest =
    "{\n" +
    '"token" : "' +
    connToken +
    '",\n' +
    '"dbName": "' +
    dbName +
    '",\n' +
    '"cmd" : "PUT",\n' +
    '"rel" : "' +
    relName +
    '",\n' +
    '"jsonStr": \n' +
    jsonObj +
    "\n" +
    "}";
  return putRequest;
}

function createGET_BY_KEYRequest(connToken, dbName, relName, keyJson) {
  var getRequest =
    "{\n" +
    '"token" : "' +
    connToken +
    '",\n' +
    '"dbName": "' +
    dbName +
    '",\n' +
    '"cmd" : "GET_BY_KEY",\n' +
    '"rel" : "' +
    relName +
    '",\n' +
    '"jsonStr": \n' +
    keyJson +
    "\n" +
    "}";
  return getRequest;
}

function createUPDATERequest(connToken, jsonObj, dbName, relName) {
  var updateRequest =
    "{\n" +
    '"token" : "' +
    connToken +
    '",\n' +
    '"dbName": "' +
    dbName +
    '",\n' +
    '"cmd" : "UPDATE",\n' +
    '"rel" : "' +
    relName +
    '",\n' +
    '"jsonStr": \n' +
    jsonObj +
    "\n" +
    "}";
  return updateRequest;
}

// Execute JPDB request with jQuery POST and parse response JSON
function executeJPDBRequest(reqString, endpoint, successCb, errorCb) {
  var url = jpdbBaseUrl + endpoint;
  $.post(url, reqString, function (result) {
    try {
      var jsonObj = typeof result === "object" ? result : JSON.parse(result);
      successCb(jsonObj);
    } catch (e) {
      if (errorCb) errorCb(e);
    }
  }).fail(function (xhr) {
    if (errorCb) {
      errorCb(xhr);
    } else {
      alert("Request failed: " + xhr.responseText);
    }
  });
}

// UI helpers to control form state
function setFormStateForRollEntry() {
  $("#rollNo").prop("disabled", false).val("").focus();
  $("#fullName,#studentClass,#birthDate,#address,#enrollDate")
    .prop("disabled", true)
    .val("");
  $("#saveBtn,#updateBtn,#resetBtn").prop("disabled", true);
}

function setFormStateForNewRecord() {
  $("#rollNo").prop("disabled", false);
  $("#fullName,#studentClass,#birthDate,#address,#enrollDate")
    .prop("disabled", false)
    .val("");
  $("#saveBtn").prop("disabled", false);
  $("#updateBtn").prop("disabled", true);
  $("#resetBtn").prop("disabled", false);
  $("#fullName").focus();
}

function setFormStateForExistingRecord() {
  $("#rollNo").prop("disabled", true);
  $("#fullName,#studentClass,#birthDate,#address,#enrollDate").prop(
    "disabled",
    false,
  );
  $("#saveBtn").prop("disabled", true);
  $("#updateBtn").prop("disabled", false);
  $("#resetBtn").prop("disabled", false);
  $("#fullName").focus();
}

function validateFormFields() {
  // Basic client-side validation before save/update
  var rollNo = $("#rollNo").val().trim();
  var fullName = $("#fullName").val().trim();
  var studentClass = $("#studentClass").val().trim();
  var birthDate = $("#birthDate").val().trim();
  var address = $("#address").val().trim();
  var enrollDate = $("#enrollDate").val().trim();

  if (!rollNo) {
    alert("Roll No is required");
    $("#rollNo").focus();
    return false;
  }
  if (!fullName) {
    alert("Full Name is required");
    $("#fullName").focus();
    return false;
  }
  if (!/^[A-Za-z ]+$/.test(fullName)) {
    alert("Full Name must contain alphabets and spaces only");
    $("#fullName").focus();
    return false;
  }
  if (!studentClass) {
    alert("Class is required");
    $("#studentClass").focus();
    return false;
  }
  if (!birthDate) {
    alert("Birth Date is required");
    $("#birthDate").focus();
    return false;
  }
  if (!address) {
    alert("Address is required");
    $("#address").focus();
    return false;
  }
  if (!enrollDate) {
    alert("Enrollment Date is required");
    $("#enrollDate").focus();
    return false;
  }
  return true;
}

function getFormData() {
  // Collect form values into a record object
  return {
    rollNo: $("#rollNo").val().trim(),
    fullName: $("#fullName").val().trim(),
    studentClass: $("#studentClass").val().trim(),
    birthDate: $("#birthDate").val().trim(),
    address: $("#address").val().trim(),
    enrollDate: $("#enrollDate").val().trim(),
  };
}

function isRecordLike(data) {
  // Minimal check to see if a response looks like a student record
  return data && (data.rollNo !== undefined || data.fullName !== undefined);
}

function fillForm(data, rollNo) {
  // Populate the form with data from the database
  $("#rollNo").val(data.rollNo || rollNo);
  $("#fullName").val(data.fullName || "");
  $("#studentClass").val(data.studentClass || "");
  $("#birthDate").val(data.birthDate || "");
  $("#address").val(data.address || "");
  $("#enrollDate").val(data.enrollDate || "");
}

$(document).ready(function () {
  // Initial state: only Roll No is enabled for lookup
  setFormStateForRollEntry();

  $("#fullName").on("input", function () {
    // Keep Full Name alphabetic to match validation rules
    var cleaned = $(this)
      .val()
      .replace(/[^A-Za-z ]/g, "");
    if (cleaned !== $(this).val()) {
      $(this).val(cleaned);
    }
  });

  $("#rollNo").on("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      $("#rollNo").blur();
    }
  });

  $("#rollNo").on("blur", function () {
    // Lookup by Roll No on blur to decide between create vs update
    var rollNo = $("#rollNo").val().trim();
    if (!rollNo) {
      setFormStateForRollEntry();
      return;
    }

    var keyJson = JSON.stringify({ rollNo: rollNo });
    var getReq = createGET_BY_KEYRequest(jpdbToken, dbName, relName, keyJson);
    executeJPDBRequest(
      getReq,
      jpdbIrlEndpoint,
      function (res) {
        // Normalize response shape: res.data may be string, array, or object
        var record = null;
        var recNo = res && res.rec_no !== undefined ? res.rec_no : null;
        var dataObj = res && res.data ? res.data : null;

        if (typeof dataObj === "string") {
          try {
            dataObj = JSON.parse(dataObj);
          } catch (e) {
            dataObj = null;
          }
        }

        if (Array.isArray(dataObj) && dataObj.length > 0) {
          record = dataObj[0];
        } else if (dataObj && dataObj.record) {
          record = dataObj.record;
        } else if (isRecordLike(dataObj)) {
          record = dataObj;
        }

        if (
          dataObj &&
          dataObj.rec_no !== undefined &&
          dataObj.rec_no !== null
        ) {
          recNo = dataObj.rec_no;
        }

        if (record) {
          // Existing record: fill form and enable update
          fillForm(record, rollNo);
          if (recNo !== null && recNo !== undefined) {
            localStorage.setItem("student_rec_no", String(recNo));
          } else {
            localStorage.removeItem("student_rec_no");
          }
          setFormStateForExistingRecord();
        } else {
          // New record: enable save
          localStorage.removeItem("student_rec_no");
          setFormStateForNewRecord();
        }
      },
      function () {
        setFormStateForNewRecord();
      },
    );
  });

  $("#saveBtn").on("click", function () {
    // Create new record
    if (!validateFormFields()) return;
    var obj = getFormData();
    var jsonStr = JSON.stringify(obj);
    var putReq = createPUTRequest(jpdbToken, jsonStr, dbName, relName);
    executeJPDBRequest(
      putReq,
      jpdbImlEndpoint,
      function (res) {
        alert("Saved successfully\n" + JSON.stringify(res));
        setFormStateForRollEntry();
      },
      function (err) {
        alert("Save failed: " + (err.responseText || err.statusText || err));
      },
    );
  });

  $("#updateBtn").on("click", function () {
    // Update existing record by JPDB internal record number
    if (!validateFormFields()) return;
    var recNo = localStorage.getItem("student_rec_no");
    var recNoNum = Number(recNo);
    if (!Number.isFinite(recNoNum)) {
      alert("Record number missing. Please re-fetch the Roll No.");
      return;
    }
    var obj = getFormData();
    var updateJsonStr = JSON.stringify({ [String(recNoNum)]: obj });
    var updateReq = createUPDATERequest(
      jpdbToken,
      updateJsonStr,
      dbName,
      relName,
    );
    executeJPDBRequest(
      updateReq,
      jpdbImlEndpoint,
      function (res) {
        alert("Updated successfully\n" + JSON.stringify(res));
        setFormStateForRollEntry();
      },
      function (err) {
        alert("Update failed: " + (err.responseText || err.statusText || err));
      },
    );
  });

  $("#resetBtn").on("click", function () {
    // Clear state and return to lookup mode
    localStorage.removeItem("student_rec_no");
    setFormStateForRollEntry();
  });
});
