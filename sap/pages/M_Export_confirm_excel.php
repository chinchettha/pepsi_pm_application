<?php
// โค้ดไฟล์ dbconnect.php ดูได้ที่ http://niik.in/que_2398_5642
session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
 


// include composer autoload
require '../vendor/autoload.php';

$tbl_policy = "view_exportconfirm";
 
// import the PhpSpreadsheet Class
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
 
// Set value binder
\PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder( new \PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder() );
//\PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder( new \PhpOffice\PhpSpreadsheet\Cell\AdvancedValueBinder() );
 
$spreadsheet = new Spreadsheet(); // สร้าง speadsheet object
$sheet = $spreadsheet->getActiveSheet(); // กำหนดการทำงานที่่แผ่นงานปัจจุบัน

// กำหนดค่าเริ่มต้น รูปแบบ
$spreadsheet->getDefaultStyle()->getFont()->setName('TH SarabunPSK');
$spreadsheet->getDefaultStyle()->getFont()->setSize(16);
 
// แสดงข้อมูลทั้งหมดของตาราง tbl_excel1
// ******************* Update 28/29/63 ******************
if($_SESSION["wkctr"] == 'PAC007' || $_SESSION["wkctr"] == "PRO005"  ){ // ให้ user 80004584 กับ user 40220658 Exoprt ได้ทุกใบ
    $sql = " SELECT * FROM $tbl_policy where ( syst='CRTD' or syst='REL')   order by wkorder asc  ";
}else{
    $sql = " SELECT * FROM $tbl_policy where ( syst='CRTD' or syst='REL') and cwkctr='$_SESSION[wkctr]'  order by wkorder asc  ";
} // ให้ user 80004584 กับ user 40220658 Exoprt ได้ทุกใบ
// ******************* Update 28/29/63 ******************

$query = mysqli_query($link, $sql);


// กำหนดค่าให้กับพิกัด Cell ในรูปแบบข้อมูล array
// กำหนดหัวข้อคอลัมน์
// กำหนดหัวข้อคอลัมน์
$columnName = ['','Comfirmation',	'Order',	'Operation',	'SubO',	'Ca..',	'Split'	,'Wrk Ctr',	'Act.Work',	'unit',	'Start date Exe.',	'End Date Exe.',	'Start Execute',	'End Execute']; 
$sheet->fromArray($columnName); // array ข้อมูลหัวข้อคอลัมน์

$i=2;
while($result = mysqli_fetch_array($query)){
    $sheet->setCellValue("A$i", $i-1 )
    ->setCellValue("B$i", '')
    ->setCellValue("C$i", $result['wkorder'])
    ->setCellValue("D$i", $result['opac'])
    ->setCellValue("E$i", '')
    ->setCellValue("F$i", '')
    ->setCellValue("G$i", '')
    ->setCellValue("H$i", $result["wkctr"])
    ->setCellValue("I$i", $result["timewk"])
    ->setCellValue("J$i", $result["unitc"])
    ->setCellValue("K$i", date('dmY', $result["stdate"]))
    ->setCellValue("L$i", date('dmY',$result["endate"] ))
    ->setCellValue("M$i", date('H:i', $result["stdate"] ))
    ->setCellValue("N$i", date('H:i', $result["endate"] ));
    $i++;
} // end for

// จัดขนาดความกว้างของ cell อย่างง่าย ตามจำนวนฟิลด์คอลัมน์ของฐานข้อมูล 
// ในที่นี้เราดึงฟิลด์ข้อมูลทั้งหมดในตาราง tbl_excel1 ซึ่งมีทั้งหมด 12 ฟิลด์ ก็แทนด้วยคอลัมน์ A ถึง L
foreach(range('A','N') as $column) {
    $sheet->getColumnDimension($column)->setAutoSize(true); 
}
 
 
$writer = new Xlsx($spreadsheet);
$output_file = "Export_Confirm.xlsx"; // กำหนดชื่อไฟล์ excel ที่ต้องการ
$writer->save($output_file); // สร้าง excel 
//$writer->save('php://output');

if(file_exists($output_file)){ // ตรวจสอบว่ามีไฟล์ หรือมีการสร้างไฟล์ แล้วหรือไม่
    header( "location: $output_file" );
    exit(0);
    //echo '<a href="'.$output_file.'" target="_blank">Download</a>';
}
