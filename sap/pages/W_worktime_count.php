<?php
//$strSQL = "SELECT * FROM tbmanhours WHERE idwkctr='".$_SESSION['mem_id']."' ;";
$strSQL = " SELECT
count(tbmanhours.idwkctr) AS cnt_idwkctr,
tbmanhours.idwkctr AS idwkctr,
tbmanhours.workday AS workday,
tbmanhours.wh AS wh,
sum(tbmanhours.ot1) AS ot1,
sum(tbmanhours.ot15) AS ot15,
sum(tbmanhours.ot1hol) AS ot1hol,
sum(tbmanhours.ot2) AS ot2,
sum(tbmanhours.ot3) AS ot3
FROM tbmanhours
WHERE idwkctr='".$_SESSION['mem_id']."'
GROUP BY
tbmanhours.idwkctr ";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
$startday  = date("d.m.Y", $result['workday']);
$endday  = date("d.m.Y", $result['workday']);
$wh = $result['wh'];
$ot1 = $result['ot1'];
$ot15 = $result['ot15'];
$ot1hol = $result['ot1hol'];
$ot2 = $result['ot2'];
$ot3 = $result['ot3'];
$total = $wh+$ot1+$ot15+$ot1hol+$ot2+$ot3;
echo $total ;
?>