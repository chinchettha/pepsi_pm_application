<?php  
//$title_page = tb_equipment;
$tbl_policy = "tb_equipment";
$myfile = "tb_equipment";

$filed1 = "id_equipment"; // id คีย์หลัก
$filed2 = "equipment";
$filed3 = "equipment_des";
$filed4 = "equipment_com";

//export.php  
//$link = mysqli_connect("localhost", "root", "", "testing");
//include connection file 
include_once("../include/connection.php");

$output = '';
//if(isset($_POST["export"]))
if(isset($_REQUEST["export"]))
//if ($_REQUEST['op'] == "export")
{
 $query = "SELECT * FROM tb_equipment";
 $result = mysqli_query($link, $query);
 if(mysqli_num_rows($result) > 0)
 {
  $output .= '
   <table class="table" bordered="1">  
	<tr>  
		 <th>id_equipment</th>  
		 <th>equipment</th>  
		 <th>equipment_des</th>  
		 <th>equipment_com</th>  
	</tr>
  ';
  while($row = mysqli_fetch_array($result))
  {
   $output .= '
	<tr>  
		 <td>'.iconv('UTF-8','TIS-620',$row['id_equipment']).'</td>  
		 <td>'.$row['id_equipment'].'</td>  
		 <td>'.$row['equipment'].'</td>  
		 <td>'.$row['equipment_des'].'</td>  
		 <td>'.$row['equipment_com'].'</td>  
	</tr>
   ';
  }
  $output .= '</table>';
  header('Content-Type: application/xls');
  header('Content-Disposition: attachment; filename=download.xls');
  echo $output;
 }
}
?>
