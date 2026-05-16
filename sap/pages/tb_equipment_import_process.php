<div class="card-body">

<?php
require('excel-upload/library/php-excel-reader/excel_reader2.php');
require('excel-upload/library/SpreadsheetReader.php');
//require('../excel-upload/db_config.php');
//include('../include/connection.php');
	
if(isset($_POST['Submit'])){
	$mimes = ['application/vnd.ms-excel','text/xls','application/vnd.oasis.opendocument.spreadsheet'];
	if(in_array($_FILES["file"]["type"],$mimes)){

		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);
		
		$uploadFilePath = 'excel-upload/uploads/'.basename($_FILES['file']['name']);
		move_uploaded_file($_FILES['file']['tmp_name'], $uploadFilePath);

		$Reader = new SpreadsheetReader($uploadFilePath);

		//$totalSheet = count($Reader->sheets());
		$totalSheet = 1;

		echo "รายการที่นำเข้า You have total ".$totalSheet." sheets".

		$html="<table class='table table-bordered' id='' width='100%' cellspacing='0' data-page-length=''>";
		$html.="
		<thead class='thead-dark'>
		<tr>
		<th>id_equipment</th>
		<th>equipment</th>
		<th>equipment_des</th>
		<th>equipment_com</th>
		</tr>";

		/* For Loop for all sheets */
		for($i=0;$i<$totalSheet;$i++){

			$Reader->ChangeSheet($i);
			$n=0;
			foreach ($Reader as $Row)
	        {
				$n++;
	        	$html.="<tr>";
				/* Check If sheet not emprt */
		        //$id_equipment = '';
				$equipment = isset($Row[11]) ? $Row[11] : '';
				$equipment_des = isset($Row[12]) ? $Row[12] : '';
				$equipment_com = '';
				$html.="<td>".$n."</td>";
				$html.="<td>".$equipment."</td>";
				$html.="<td>".$equipment_des."</td>";
				$html.="<td>".$equipment_com."</td>";
				$html.="</tr>";

				$query = "insert into tb_equipment(equipment,equipment_des) values('".$equipment."','".$equipment_des."')";
	 
				$link->query($query);

	        }

		}

		$html.="</table>";
		echo $html;
		echo "<br />Data Inserted in dababase";

	}else { 
		die("<br/><i class='fas fa-question-circle'></i> Sorry, File type is not allowed. Only Excel file."); 
	}

}

?>
</div>
