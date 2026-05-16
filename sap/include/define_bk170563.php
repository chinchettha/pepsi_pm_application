<?php
define("SYS", "Planning Scheduling and Close Work Order.");
define("COMPANY", "Planning Scheduling and Close Work Order.");
define("COMPANY_SHORT", "Planning Scheduling and Close Work Order.");
define("TITLE", "Planning Scheduling and Close Work Order.");
define("navbar_brand", "  Planning PM/CM.");
define("mem_id", $_SESSION['mem_id']);

define("star_red", "<font color=red><b>*</b></font>");

// ตั้งค่าวันที่
$y1= date("Y");
$m1= date("m");
$d1= date("d");
$y2= $y1+543;
$th_datenow=$d1."/".$m1."/".$y2;
$en_datenow=$y1."-".$m1."-".$d1;
@define ("datenow_th",$th_datenow,true);

//เพิ่มใหม่ ไก่************
date_default_timezone_set("Asia/Bangkok");
ini_set('max_execution_time', 300); //300 seconds = 5 minutes

$GLOBALS["DayBackLog"] = 31; // จำนวนวันที่เกินกำหนด Backlog
$GLOBALS["ColorBackLog"]="#ffff66"; // สี Backlog
$GLOBALS["ColorMove"]="#ffa31a"; // สี ย้ายข้ามเดือน

//วันที่ปัจจุบัน mktime
$datenow = date("m/d/Y");
$DayNow = explode("/", $datenow);
$GLOBALS["DayNow"] = mktime(0,0,0,$DayNow[0],$DayNow[1],$DayNow[2]); //mktime(hour, minute, second, month, day, year)
//เพิ่มใหม่ ไก่************

?>