<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง

//$title_page = tb_equipment;
$tbl_policy = "tb_equipment";
$myfile = "tb_equipment";
echo "xxxxxxxxxxxxxxxxxxxx";


//include('../include/connection.php');
//$strSQL = " SELECT * FROM tb_equipment where id_equipment ='".$_REQUEST['id']."';";
//$query = mysqli_query($link, $strSQL);
//$result = mysqli_fetch_array($query);

//หากมีการกดปุ่มบันทึก
//if ($_REQUEST['op'] == "save") {


     //ตรวจสอบการกรอกข้อมูลว่ามีการดำเนินการกรอกข้อมูลแล้วหรือยัง
     $sql = "SELECT * FROM $tbl_policy WHERE id_equipment = '" . $_REQUEST['id'] . "' ";
     $result_chk = $link->query($sql);

     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " equipment='" . $_REQUEST['equipment'] . "',equipment_des='" . $_REQUEST['equipment_des'] . "',equipment_com='" . $_REQUEST['equipment_com'] . "' ";
          $sqlupdate_main .= " WHERE id_equipment = '" . $_REQUEST['id'] . "' ";
          $result = $link->query($sqlupdate_main);
		  echo $sqlupdate_main;
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $sqlinsert_main = "INSERT $tbl_policy (equipment,equipment_des,equipment_com) VALUES ('" . $_REQUEST['equipment'] . "','" . $_REQUEST['equipment_des'] . "','" . $_REQUEST['equipment_com'] . "')";
          $result = $link->query($sqlinsert_main);
		  echo $sqlupdate_main;
     }


echo $sqlupdate_main;
echo "0000000000 = ". $sqlupdate_main;
//}


?>