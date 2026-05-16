<?php
$name_type = "tb_equipment"; // ชื่อ database  tb
$name_page = "import_test"; // ชื้อ module

if ($action == "updata") {

    $update_file = $_GET['file_name'];
    $id_status = $_GET['id_file'];
    //$data = file("../file_upload/$update_file");//อ่านข้อมูลจากไฟล์info.txt
    //$sum_row=count($data)-1;//นับจำนวนแถว
    //
    $FILE = fopen("file_upload/$update_file", "r"); // ใส่ชื่อไฟล์ และ โหมด r เพื่ออ่านข้อมูลจากไฟล์อย่างเดียว 
    //echo $sum_row = count($FILE)-1; exit();//นับจำนวนแถว
    $data = fgetcsv($FILE, 10000);
    $i = 1;
    $no = 1;
    do {
        if ($i == 1) {
            // แถวที่ 1 ที่เป็นหัวตาราง ให้ข้ามไป ไม่ Import ลงตาราง 
            //$data = fgetcsv($FILE, 10000);
            $i++;
        } else {

           
            $data = fgetcsv($FILE, 10000);
            $arr0 = $data[0]; // 
            $arr1 = $data[1]; // 
            $arr2 = $data[2]; //
            $arr3 = $data[3]; // 
            $arr4 = $data[4]; // 

           $sql = "insert into $name_type value('','$arr0','$arr1','$arr2','$arr3','$arr4');";
            //exit();
            $query = mysqli_query($link, $sql);

            $i++;
            $no++;
        }
    }
    //while (!feof($FILE));
    //$sql_update = "UPDATE history_deduct SET sum_row_deduct = '$i',status_upload_deduct = '1' WHERE id_history_deduct ='$id_status';";
    //$result_update = mysqli_query($link, $sql_update);
    //if ($result_update) {
    //    echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=$PHP_SELF?module=$name_page'>";
    //}
} 
/*
if (isset($_GET['TRUNCATE'])) {
    $field = $_GET['field'];
    $id_trun = $_GET['id_trun'];

    $sql_emty = "delete from $name_type where $field=$id_trun";
    $result_emty = mysqli_query($link, $sql_emty);
    if ($result_emty) {
        $sql_update = "UPDATE history_deduct SET sum_row_deduct = '0',status_upload_deduct = '0' WHERE id_history_deduct ='$id_trun';";
        $result_update = mysqli_query($link, $sql_update);
        echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=$PHP_SELF?module=$name_page'>";
    }
*/

}
?>

<div class="card-body">

	<fieldset>
		<form action="" method="post" enctype="multipart/form-data">

		<div class="col-md-12">
			<div class="form-group">
				<label for="txt_image">ไฟล์เอกสารแนบ <span style="font-weight: normal; color: #ED5565">"CSV"</span></label>
				<input id="input-ficons-1" type="file" class="form-control" 
					   data-show-upload="true" 
					   name="txt_file" data-validation="required"
					   data-validation-error-msg="กรุณาเลือกไฟล์ข้อมูล..." accept=".csv,.xls" required><br>

			</div>
		</div>
		<div class="col-md-12" style="border-bottom: #e6e9ed solid 1px; padding-bottom: 15px; margin-bottom: 10px;">
			<strong> โดย : </strong><span id="font-mediumgray"><?php echo show_name(); ?></span>
			<strong>&nbsp;&nbsp; ข้อมูล ณ วันที่: </strong><span id="font-mediumgray"><?php echo datethai($date); ?></span>
		</div>

		<!-- input states -->
		<div class="box-footer">                    
			<input type="hidden" name="txt_date" value="<?php echo $date; ?>">
			<input type="hidden" name="job" value="add_file">
			<input type="hidden" name="id_project" value="<?php echo $id_project; ?>">
			<input type="hidden" name="action" value="insert">
			<input type="hidden" name="txt_category" value="<?php echo $txt_id_category; ?>">
			<button type="submit" name="submit" id="save_info"  class="btn btn-info btn-sm pull-right" >บันทึกข้อมูล
			</button>
		</div>            
		<!-- Select multiple-->

		</form>
	</fieldset>
</div>
