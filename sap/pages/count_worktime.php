<?php
$strSQL = "SELECT * FROM tb_iw37n WHERE workctr = '".$_SESSION['username']."' ;";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
$startday  = date("d.m.Y", $result['bscstart']);
$endday  = date("d.m.Y", $result['actfinish']);
$worktime  = $result['worktime'];
echo $worktime ;
//echo "<br>startday".$startday ;
//echo "<br>endday".$endday ;
//echo "<br>".$strSQL;

?>