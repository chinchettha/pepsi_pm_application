<?php
global $link;

function getTableArray($table, $where, $id, $field) {  //ส่งค่า 1 record 
    global $link;
    $strSQL = "select * from $table  $where $id ";
    $query_f = mysqli_query($link, $strSQL);
    $result = mysqli_fetch_array($query_f);
    return $show_array = $result[$field];
    //return $show_array;
}

function DeleteArray($table, $id, $field) {  //ส่งค่า 1 record 
    global $link;
    $strSQL = "delete  from $table where $field=$id ";
    $query = mysqli_query($link, $strSQL);
    $result= mysqli_fetch_array($query);  	
    return true;
    //return $show_array;
}


function ok_reload($text = "") {
    ?>
    <script language='JavaScript'>
        alert('ok')
        JavaScript:window.close(parent)
        opener.location.reload();
    </script>
    <?php
}

function up_file($img, $imglocate) {
    if ($img['name'] != '') {
        $fileupload1 = $img['tmp_name'];
        echo $g_img = explode(".", $img['name']);
        exit();
        $file_up = date("Ymd") . time() . "." . $g_img[1];  // เปลี่ยนชื่อไฟล์ไหม่ เป็นตัวเลข  
        if ($fileupload1) {
            $array_last = explode(".", $file_up);
            $c = count($array_last) - 1;
            $lastname = strtolower($array_last[$c]);
            @copy($fileupload1, $imglocate . $file_up);
        }
    }
    if ($img['name'] != '') {
        return $file_up; // ส่งกลับชื่อไฟล์  
    }
}

function show_name() {
    //global mem_id;
    echo $mem_name = getTableArray("tbl_member", "where  mem_id=", mem_id, "mem_name");
}

function show_admin($id) {
    //global mem_id;
    echo $mem_name = getTableArray("tbl_member", "where  mem_id=", $id, "mem_name");
}

function show_event($module) {
    switch ($module) {

        case "info": return $name_event = TITLE;
            break;
        case "view_project": return $name_event = "ระบบ Project";
            break;
        case "from_project": return $name_event = "เพิ่ม Project";
            break;
        case "view_list_file": return $name_event = "นำเข้า file";
            break;
        case "view_list_name": return $name_event = "เพิ่มรายชื่อ";
            break;
        case "view_member": return $name_event = "ระบบสมาชิก";
            break;
        case "view_list_person": return $name_event = "โครงการ";
            break;
        case "view_list_file_person": return $name_event = "เพิ่มรายชื่อ";
            break;
        
    }
}

function IP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {   //to check ip is pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

function datethai($x) {
    $thai_m = array("ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.");
    $date_array = explode("-", $x);
    $y = $date_array[0];
    $m = $date_array[1] - 1;
    $d = $date_array[2];
    $m = $thai_m[$m];
    $y = substr($y + 543, -2);
    $displaydate = "$d $m $y";
    return $displaydate;
}

$thai_month_arr2 = array(
     "0" => "",
     "01" => "มกราคม",
     "02" => "กุมภาพันธ์",
     "03" => "มีนาคม",
     "04" => "เมษายน",
     "05" => "พฤษภาคม",
     "06" => "มิถุนายน",
     "07" => "กรกฎาคม",
     "08" => "สิงหาคม",
     "09" => "กันยายน",
     "10" => "ตุลาคม",
     "11" => "พฤศจิกายน",
     "12" => "ธันวาคม"
);
function thai_month($x) {
    global $thai_month_arr2;
    $thai_month_return2 = $thai_month_arr2[$x];
    return $thai_month_return2;
}

function datethailong($x) {
    $thai_m = array("มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม");
    $date_array = explode("-", $x);
    $y = $date_array[0];
    $m = $date_array[1] - 1;
    $d = $date_array[2];
    $m = $thai_m[$m];
    $y = $y + 543;
    $displaydate = "$d $m $y";
    return $displaydate;
}

function getmumrow($table, $where) {  //ส่งค่า 1 record 
    global $link;
    $strSQL = "select count(*) as num from $table  $where";
    $query_f = mysqli_query($link, $strSQL);
    $result = mysqli_fetch_array($query_f);
    return $result_row = $result['num'];
    //return $show_array;
}

function getmumrowDis($table, $where, $filed) {  //ส่งค่า 1 record 
    global $link;
    $strSQL = "select count(DISTINCT $filed) as num from $table  $where";
    $query_f = mysqli_query($link, $strSQL);
    $result = mysqli_fetch_array($query_f);
    return $result_row = $result['num'];
    //return $show_array;
}

function iconAwsome($num = 0) {
    if ($num == "01" || $num == 61 || $num == 91)
        $rs = "<i class='fa fa-pencil-square-o'></i>";
    if ($num == "02" || $num == 62 || $num == 92)
        $rs = "<i class='fa fa-odnoklassniki'></i>";
    if ($num == "03" || $num == 63 || $num == 93)
        $rs = "<i class='fa fa-euro'></i>";
    if ($num == "04" || $num == 64 || $num == 94)
        $rs = "<i class='fa fa-calculator'></i>";
    if ($num == "05" || $num == 65 || $num == 95)
        $rs = "<i class='fa fa-eyedropper'></i>";
    return $rs;
}

function bgColor($num = 0) {
    if ($num == 1)
        $rs = "bg-green";
    if ($num == 2)
        $rs = "bg-aqua-gradient";
    if ($num == 3)
        $rs = "bg-maroon-gradient";
    if ($num == 4)
        $rs = "bg-red-gradient";
    if ($num == 5)
        $rs = "bg-yellow-gradient";
    return $rs;
}

function test_input($text) {
    $text = trim($text);
    $text = stripslashes($text);
    $text = htmlspecialchars($text);
    return $text;
}

foreach ($_POST as $key => $value) {
    $$key = test_input($value);
}

foreach ($_GET as $key => $value) {
    $$key = test_input($value);
}

function upimg($img, $imglocate) {
    if ($img['name'] != '') {
        $fileupload1 = $img['tmp_name'];
        $g_img = explode(".", $img['name']);
        $file_up = time() . "." . $g_img[1];
        if ($fileupload1) {
            $array_last = explode(".", $file_up);
            $c = count($array_last) - 1;
            $lastname = strtolower($array_last[$c]);
            @copy($fileupload1, $imglocate . $file_up);
        }
    }
    return $file_up;
}

date_default_timezone_set('Asia/Bangkok');
date("H:i:s");
$date = date("Y-m-d");
$thai_day_arr = array("อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์");
$thai_month_arr = array(
     "0" => "",
     "1" => "มกราคม",
     "2" => "กุมภาพันธ์",
     "3" => "มีนาคม",
     "4" => "เมษายน",
     "5" => "พฤษภาคม",
     "6" => "มิถุนายน",
     "7" => "กรกฎาคม",
     "8" => "สิงหาคม",
     "9" => "กันยายน",
     "10" => "ตุลาคม",
     "11" => "พฤศจิกายน",
     "12" => "ธันวาคม"
);

function thai_date($time) {
    global $thai_month_arr;
    $thai_date_return = "" . date("j", $time);
    $thai_date_return .= " " . $thai_month_arr[date("n", $time)];
    $thai_date_return .= " " . (date("Y", $time) + 543);
    return $thai_date_return;
}
function referer(){
      //อ่าน referer ว่ามาจาก URL อะไร
  @$referer=$_SERVER[HTTP_REFERER];
  //URL ของไซต์นี้
  @$host=$_SERVER[HTTP_HOST];

  //ตรวจสอบว่า referer มาจาก URL นี้หรือไม่ ถ้าไม่จะไปหน้า Index ก่อน
  if (!eregi($host, $referer)) 
            //header( "location:index.php" );
            //exit(0);
            echo "<META HTTP-EQUIV=refresh CONTENT=\"0; URL=index.php\">";

  //ถ้าใช่ทำงานต่อ
}
function count_table($name_type) {
    global $link;
    $sql_count = "SELECT count(*) as num FROM $name_type   WHERE 1;";
    $result_count = mysqli_query($link, $sql_count);
    $row_count = mysqli_fetch_array($result_count);
    $show_count_row = $row_count['num'];
    return $show_count_row;
}

//Show Resouces **เพิ่มใหม่ ไก่
//Show Resouces 
function ShowResources($wkctr) {
    global $link;
    $sql = "SELECT * FROM tbwkctrgroup   WHERE wkctrgroup = '$wkctr' ";
    $result = mysqli_query($link, $sql);
    $totalC = mysqli_num_rows($result);
    if($totalC >0){
        $row = mysqli_fetch_array($result);
        $Resouces = $row["wkctrdescription"];
    }else{
        $sql2 = " SELECT * FROM tbworkcenter WHERE wkctr =  '$wkctr' ";
        $result2 = mysqli_query($link, $sql2);
        $totalC2 = mysqli_num_rows($result2);
        if($totalC2 > 0){
            $row2 = mysqli_fetch_array($result2);
            $Resouces = "คุณ". $row2["namewkctr"] . " " . $row2["surnamewkctr"] ;
        }
    } 

    return $Resouces;
}
//Show Resouces

// show Field Detail
function ShowDetail($tb,$a,$b,$c){  // $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1 
    global $link;
    $sql = "SELECT * FROM $tb   WHERE $a = '$b' ";
    $result = mysqli_query($link, $sql);
    $totalC = mysqli_num_rows($result);
    if($totalC >0){
        $row = mysqli_fetch_array($result);
        $txt = $row[$c];        
    }else{
        $txt = "";
    }
    return $txt;
}
// show Field Detail

//Show input Select
function InSelect($tb,$Fval ,$val,$shoval,$r){   // InSelect(table, field Value ,value, Show value, required )
    global $link;
?>
<select name="<?PHP echo $Fval; ?>" id="<?PHP echo $Fval; ?>" class="form-control"   <?PHP echo  $r ; ?> >	
						  	<option value=""> -- Select -- </option>
							 <?php
							 $strSQL = "SELECT * FROM $tb "  ;
							 $objQuery = mysqli_query($link,$strSQL) or die ("Error Query [".$strSQL."]");
							 while($objResut = mysqli_fetch_array($objQuery)) {
								if($val == $objResut[$Fval] ){
								?>
								<option value="<?php echo $objResut[$Fval];?>" selected ><?php echo  $objResut[$shoval] ;?></option>
								<?PHP
								}else{
								?>
								 <option value="<?php echo $objResut[$Fval];?>"><?php echo  $objResut[$shoval];?></option>
								<?PHP 
								}
							 } ?>
						 </select>
<?PHP 
}
//Show input Select

//Show Resouces **เพิ่มใหม่ ไก่

?>
