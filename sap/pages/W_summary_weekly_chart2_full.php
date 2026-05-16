<style>
body {
  margin-left: -80px;
}
</style>
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

<!-- <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script> -->
<script type="text/javascript" src="../assets/chart_google/loader.js"></script>
<script type="text/javascript">
google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
var data = google.visualization.arrayToDataTable([
["Element", "คิดเป็น % ", { role: "style" } ],
//["Copper", 8.94, "#b87333"],
//["Silver", 10.49, "silver"],
//["Gold", 19.30, "gold"],
//["Platinum", 21.45, "color: #e5e4e2"],


<?php
while($result = mysqli_fetch_array($query))
{
	$color = '#'.substr(md5(rand()), 0, 6);//สุ่มสี
?>

["<?php echo $result['idwkctr'];?>", <?php echo $result['SummaryW'];?>, "<?php echo $color;?>"],


<?php }?>

]);
var view = new google.visualization.DataView(data); view.setColumns([0, 1, { calc: "stringify", sourceColumn: 1, type: "string", role: "annotation" }, 2]);
var options = { title: "Technician Utilizations",  width: 1400, height: 500, bar: {groupWidth: "100%"}, legend: { position: "none" }, };
var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values")); chart.draw(view, options); }
</script>

<div id="columnchart_values" style="width: 100%; height: 100%;"></div>

