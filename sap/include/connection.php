<?php

/* ตัวแปรที่ใช้ในการคอนฟิกค่าต่างๆของเว็บ */
$GLOBALS["host"] ="localhost";  // ip เครื่อง Server ไม่ต้องเปลี่ยนถ้าใช้ mysql เครื่องเดียวกัน
$GLOBALS["Uname"] = "root";  // username เข้า mysql
$GLOBALS["Pword"] = "12345678";  // password เข้า mysql 
$GLOBALS["DBName"] = "sap_lay";  // ชื่อฐานข้อมูล ถ้าจะให้ดีก็สร้างเหมือนกันนี้เลย


function connect_db(){
    $link = mysqli_connect($GLOBALS["host"],$GLOBALS["Uname"],$GLOBALS["Pword"],$GLOBALS["DBName"]) or die(mysql_error());
    mysqli_query($link, 'SET NAMES UTF8');
    return $link;
}
$link = connect_db();


//connect Calendar ****************
try
{
	$bdd = new PDO("mysql:host=$GLOBALS[host];dbname=$GLOBALS[DBName]", $GLOBALS["Uname"] , $GLOBALS["Pword"] );
}
catch(Exception $e)
{
        die('Error : '.$e->getMessage());
}

//connect Calendar *****************

?>

