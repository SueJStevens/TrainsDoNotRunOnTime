$(function () {

  /* 
      https://tempusdominus.github.io/bootstrap-4/
      Initialize Date/Time Picker
  */
  $.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
    icons: {
      time: 'fas fa-clock',
      date: 'fas fa-calendar',
      up: 'fas fa-arrow-up',
      down: 'fas fa-arrow-down',
      previous: 'fas fa-chevron-left',
      next: 'fas fa-chevron-right',
      today: 'fas fa-calendar-check-o',
      clear: 'fas fa-trash',
      close: 'fas fa-times'
    }
  });

  $('#datetimepicker3').datetimepicker({
    format: 'HH:mm'
  });

  /* 
      https://datatables.net/
      Initialize DataTables
  */
  $('#trainSchedule').DataTable({
    columns: [
      { title: "Train Name" },
      { title: "Destination" },
      { title: "Frequency (min)" },
      { title: "Next Arrival" },
      { title: "Minutes Away" },
      { title: "Edit" }
    ]
  });

  /*
    Firebase
  */
  firebase.initializeApp(config);

  // Create a variable to reference the database.
  var database = firebase.database();

  // Initial Values
  var trainName = "";
  var destination = "";
  var firstTrainTime = "";
  var frequency = 0;



  /* 
     Capture Submit Button Click
  */
  $("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    //User Input
    var trainName = $("#train-name-input").val();
    var destination = $("#destination-input").val();
    var firstTrainTime = $("#firstTrainTime-input").val();
    var frequency = $("#frequency-input").val();

    //validation:
    validateForm("Train Name", trainName);
    validateForm("Destination", destination);
    validateForm("First Train Time", firstTrainTime);
    validateForm("Arrival Frequency", frequency);

    // Local "temporary" object for input data
    var newTrain = {
      trainName: trainName,
      destination: destination,
      firstTrainTime: firstTrainTime,
      frequency: frequency
    };

    //write values to database
    database.ref().push(newTrain);

    //alert("New Train successfully added");

    // Clear Input Form
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#firstTrainTime-input").val("");
    $("#frequency-input").val("");

  });  //end on click event for submit button


  // Firebase watcher .on("child_added"
  database.ref().on("child_added", function (snapshot) {
    // storing the snapshot.val() in a variable for convenience
    var sv = snapshot.val();

    //calculate some stuff

    console.log("First Train of the Day is: " + sv.firstTrainTime);
    console.log("Frequency in Minutes: " + sv.frequency);
    console.log("The Current Time is: " + moment().format('LLLL'));
    console.log("What Time would the next train be...?");
    // What time would the next train be...? (Use your brain first)
    // It would be 3:18 -- 2 minutes away
    var x = myFunction(sv.frequency, sv.firstTrainTime);
    nextArrival = x[0];
    minutesAway = x[1];
    console.log("Next Arrival: " + nextArrival);
    console.log("minutesAway: " + minutesAway);
    console.log("-------------------------------------------------")


    //format dates

    var table = $('#trainSchedule').DataTable();

    table.row.add([sv.trainName,
    sv.destination,
    sv.frequency,
    nextArrival,
    minutesAway,
      "Edit Icon"]
    ).draw();



    /*If I were not using DataTables, then I'd create a enw roa and append the row to the table
        //create the new row
        var newRow = $("<tr>").append(
          $("<td>").text(sv.trainName),
          $("<td>").text(sv.destination),
          $("<td>").text(sv.frequency),
          $("<td>").text("1:15 PM"),
          $("<td>").text("25"),
          $("<td>").text("Edit Icon")
        );
  
        //append the new row to the table
        $("#trainSchedule > tbody").append(newRow);
  */

    // Handle the errors
  }, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });  //End Firebase watcher

  function validateForm(field, fieldval) {
    var x = fieldval;
    if (x == "") {
      alert(field + " must be filled out");
      return false;
    }
  };  //end form validation

  function myFunction(frequency, firstTime) {
    var result = [];
    // Assumptions
    var tFrequency = frequency;

    // Time is 3:30 AM
    var firstTime = firstTime;

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    console.log(firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % tFrequency;
    console.log(tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = tFrequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

    nextArrival = moment(nextTrain).format('h:mm a');

    result=[nextArrival, tMinutesTillTrain]

    return result;

  }; //end calcNextTrain

}); //end on load jquery method
