// Configuration for JPDB
var jpdbBaseUrl = "http://api.login2explore.com:5577";
var jpdbImlEndpoint = "/api/iml";
var jpdbIrlEndpoint = "/api/irl";
var jpdbToken = "90935235|-31949242719711704|90958404";
var dbName = "SCHOOL-DB";
var relName = "STUDENT-TABLE";

// Helpers to build request strings
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

// Execute request using jQuery post
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

// UI helpers
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
  return {
    rollNo: $("#rollNo").val().trim(),
    fullName: $("#fullName").val().trim(),
    studentClass: $("#studentClass").val().trim(),
    birthDate: $("#birthDate").val().trim(),
    address: $("#address").val().trim(),
    enrollDate: $("#enrollDate").val().trim(),
  };
}

function getFieldValue(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    if (obj && obj[keys[i]] !== undefined && obj[keys[i]] !== null) {
      return obj[keys[i]];
    }
  }
  return "";
}

function normalizeRecord(data, fallbackRollNo) {
  return {
    rollNo:
      getFieldValue(data, [
        "rollNo",
        "Roll-No",
        "roll-no",
        "roll_no",
        "RollNo",
      ]) || fallbackRollNo,
    fullName: getFieldValue(data, [
      "fullName",
      "Full-Name",
      "full-name",
      "full_name",
      "FullName",
      "name",
    ]),
    studentClass: getFieldValue(data, [
      "studentClass",
      "Class",
      "class",
      "stdClass",
    ]),
    birthDate: getFieldValue(data, [
      "birthDate",
      "Birth-Date",
      "birth-date",
      "birth_date",
    ]),
    address: getFieldValue(data, ["address", "Address"]),
    enrollDate: getFieldValue(data, [
      "enrollDate",
      "Enrollment-Date",
      "enrollment-date",
      "enroll_date",
      "enrollment_date",
      "enrollmentDate",
    ]),
  };
}

function isRecordLike(data) {
  return (
    data &&
    (data.rollNo !== undefined ||
      data["Roll-No"] !== undefined ||
      data["roll-no"] !== undefined ||
      data["roll_no"] !== undefined ||
      data.fullName !== undefined ||
      data["Full-Name"] !== undefined)
  );
}

function fillForm(data, rollNo) {
  var normalized = normalizeRecord(data, rollNo);
  $("#rollNo").val(normalized.rollNo || rollNo);
  $("#fullName").val(normalized.fullName || "");
  $("#studentClass").val(normalized.studentClass || "");
  $("#birthDate").val(normalized.birthDate || "");
  $("#address").val(normalized.address || "");
  $("#enrollDate").val(normalized.enrollDate || "");
}


$(document).ready(function () {
  setFormStateForRollEntry();

  $("#fullName").on("input", function () {
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
        var record = null;
        var recNo = null;
        if (res && res.rec_no !== undefined && res.rec_no !== null) {
          recNo = res.rec_no;
        }
        if (res && res.data) {
          var dataObj = res.data;
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
            if (dataObj.rec_no !== undefined && dataObj.rec_no !== null) {
              recNo = dataObj.rec_no;
            }
          } else if (isRecordLike(dataObj)) {
            record = dataObj;
          }
          if (
            recNo === null &&
            dataObj &&
            dataObj.rec_no !== undefined &&
            dataObj.rec_no !== null
          ) {
            recNo = dataObj.rec_no;
          }
        }

        if (record) {
          fillForm(record, rollNo);
          if (recNo !== null && recNo !== undefined) {
            localStorage.setItem("student_rec_no", String(recNo));
          } else {
            localStorage.removeItem("student_rec_no");
          }
          setFormStateForExistingRecord();
        } else {
          localStorage.removeItem("student_rec_no");
          setFormStateForNewRecord();
        }
      },
      function (err) {
        setFormStateForNewRecord();
      },
    );
  });

  $("#saveBtn").on("click", function () {
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
    localStorage.removeItem("student_rec_no");
    setFormStateForRollEntry();
  });
});
