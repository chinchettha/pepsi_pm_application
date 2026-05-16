<?php
require_once('../include/connection.php');
require_once('../include/define.php');
$query_chart = "SELECT
tbmanhours.idwkctr,(wh+ot1+ot15+ot1hol+ot2+ot3) AS SummaryW
FROM
tbmanhours
";
$query = mysqli_query($link ,$query_chart);

if (!$query) {
    die('<p><strong style="color:#FF0000">!! Invalid query:</strong> ' . $mysqli->error.'</p>');
}
?>


<script>
window.onload = function () {

var chart = new CanvasJS.Chart("chartContainer", {
	animationEnabled: true,
	exportEnabled: true,
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	title:{
		text: "Technician Utilizations"
	},
	data: [{
		//type: "bar", //change type to bar, line, area, pie, etc
		type: "column", //change type to bar, line, area, pie, etc
		//indexLabel: "{y}", //Shows y value on all Data Points
		indexLabelFontColor: "#5A5757",
      	indexLabelFontSize: 16,
		indexLabelPlacement: "outside",
		dataPoints: [
			/*
			{ x: 10, y: 71 ,indexLabel: "\u2605 xs123" },
			{ x: 20, y: 55 ,indexLabel: "\u2605 xs123" },
			{ x: 30, y: 50 ,indexLabel: "\u2605 xs123" },
			{ x: 40, y: 65 ,indexLabel: "\u2605 xs123" },
			{ x: 50, y: 92, indexLabel: "\u2605 Highest" },
			{ x: 60, y: 68 ,indexLabel: "\u2605 xs123" },
			{ x: 70, y: 38 ,indexLabel: "\u2605 xs123" },
			{ x: 80, y: 71 ,indexLabel: "\u2605 xs123" },
			{ x: 90, y: 54 ,indexLabel: "\u2605 xs123"  },
			{ x: 100, y: 60 ,indexLabel: "\u2605 xs123" },
			{ x: 110, y: 36 ,indexLabel: "\u2605 xs123" },
			{ x: 120, y: 49 ,indexLabel: "\u2605 xs123" },
			//{ x: 130, y: 21, indexLabel: "\u2691 Lowest" }
			*/

<?php
while($result = mysqli_fetch_array($query))
{
?>
			{ label: <?php echo $result['idwkctr'];?>, y: <?php echo $result['SummaryW'];?> ,indexLabel: "\ <?php echo $result['SummaryW'];?>" },
			//{ x: 555, y: 100 ,indexLabel: "\u2605 xs123" },

<?php }?>
			//{ x: 130, y: 21, indexLabel: "\u2691 Lowest" }



		]
	}]
});
chart.render();

}
</script>
</head>
<body>
<div id="chartContainer" style="height: 300px; width: 100%;"></div>
<!-- <script src="https://canvasjs.com/assets/script/canvasjs.min.js"></script> -->
<script src="../assets/charts_canvasjs/canvasjs.min.js"></script>
</body>
</html>
