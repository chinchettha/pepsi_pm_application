<?php
session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');


header("Content-type:text/html; charset=UTF-8");        
header("Cache-Control: no-store, no-cache, must-revalidate");       
header("Cache-Control: post-check=0, pre-check=0", false);     


if(isset($_GET['q']) && $_GET['q']!=""){
    $q = urldecode($_GET["q"]);
    $q = $link->real_escape_string($q);
     
    $pagesize = 50; // จำนวนรายการที่ต้องการแสดง
    $table_db="view_order"; // ตารางที่ต้องการค้นหา
    $find_field="wkorder"; // ฟิลที่ต้องการค้นหา
    $sql = " SELECT  * FROM $table_db WHERE LOCATE('$q', $find_field) > 0   ORDER BY LOCATE('$q', $find_field), $find_field LIMIT $pagesize  ";
    $result = mysqli_query($link, $sql) or die ("Error Query [".$sql."]");
    if($result && $result->num_rows>0){
        while($row = $result->fetch_assoc()){
            // กำหนดฟิลด์ที่ต้องการส่ง่กลับ ปกติจะใช้ primary key ของ ตารางนั้น
            $id = $row["wkorder"] ; // 
            $wktype = $row["wktype"];
            $op =  $row["operationshorttext"] ;         
            // จัดการกับค่า ที่ต้องการแสดง 
            $name = trim($row["wkorder"]);// ตัดช่องวางหน้าหลัง
            $name = addslashes($name); // ป้องกันรายการที่ ' ไม่ให้แสดง error
            $name = htmlspecialchars($name); // ป้องกันอักขระพิเศษ
 
            // กำหนดรูปแบบข้อความที่แใดงใน li ลิสรายการตัวเลือก
            $display_name = preg_replace("/(" .$q. ")/i", "<b>$1</b>", $name);
            echo "
                <li onselect=\"this.setText('$name').setValue('$id')\">
                    $display_name / $wktype / $op
                </li>
            ";  
        }
    }
    $link->close();
}
?>