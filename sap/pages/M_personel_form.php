<?php
//include('../include/connection.php');
$title_page = "ข้อมูลนำเข้า Personel";
$tbl_policy = "tbworkcenter";
$myfile = "M_personel";
$fileload = "Personel.xlsx";

$filed1 = "idwkctr"; // id คีย์หลัก
$filed2 = "titlewkctr";
$filed3 = "namewkctr";
$filed4 = "surnamewkctr";
$filed5 = "titlewkctreng";
$filed6 = "namewkctreng";
$filed7 = "surnamewkctreng";
$filed8 = "startwork";
$filed9 = "iddepartment";
$filed10 = "idposition";
$filed11 = "wkctr";
$filed12 = "plnt";
$filed13 = "cat";
$filed14 = "resp";
$filed15 = "idwkctrgroup";
$filed16 = "idwkctrtype";
$filed17 = "idwklevel";
$filed18 = "wkctrdate";
$filed19 = "wkctrtel";
$filed20 = "wkctrmail";
$filed21 = "labourcost";
$filed22 = "userst";
$filed23 = "pass";
$filed24 = "workstatus";


$strSQL = " select * from view_workcenter where idwkctr='$_REQUEST[id]' ";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
//echo $strSQL;
?>
<style>
body,html {
    height: 100%;
}

/* when not active use specificity to override the !important on border-(color) */
.nav-tabs .nav-link:not(.active) {
    border-color: transparent !important;
}
</style>

<!--------- CSS ปฏิทิน Datepicker ----------->
<link rel="stylesheet" href="js/jquery-ui.css">
<!--------- CSS ปฏิทิน Datepicker ----------->


<div id="app" class="">
<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>" enctype="multipart/form-data" > 

	<div class="modal-header">
		<h5 class="modal-title" id="exampleModalLabel">
		<?php if ($_REQUEST['op']=="edit"){
			echo "<i class='far fa-edit nav-icon'></i>&nbsp;<span>แก้ไขข้อมูล </span>";
		}elseif ($_REQUEST['op']=="del"){
			echo "<i class='fa fa-trash nav-icon'></i>&nbsp;<span>ลบข้อมูล</span>";
		}else{
			echo "<i class='far fa-id-card nav-icon'></i>&nbsp;<span>เพิ่มข้อมูล</span>";
		}
		?>
		</h5>
		<button type="button" class="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>

	<!-- <div class="modal-body"> -->
	<div class="modal-body h-100 py-2"> 
			<ul class="nav nav-tabs border-0" id="myTab" role="tablist">
				<li class="nav-item">
					<a class="nav-link active border border-primary border-bottom-0" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">ข้อมูลส่วนตัว</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-warning border-bottom-0" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">ข้อมูลงาน</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-info border-bottom-0" id="settings-tab" data-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false">ชื่อผู้ใช้งาน&รหัสผ่าน</a>
				</li>
			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="home" role="tabpanel" aria-labelledby="home-tab">
				<?php
					include("personel_form_tab1.php");
				?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="profile" role="tabpanel" aria-labelledby="profile-tab">
				<?php
					include("personel_form_tab2.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-info" id="settings" role="tabpanel" aria-labelledby="settings-tab">
				<?php
					include("personel_form_tab3.php");
				?>			
				</div>
			</div>
		</div>
	<!-- </div> -->

	<div class="modal-footer">
		<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
		<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
		<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		<a href="<?php $PHP_SELF ?>index2.php?module=<?php echo $myfile;?>" onclick="if(confirm('Confrim Cancel.')) return true; else return false;"  role="button" class='btn btn-warning btn-save' ><i class="fa fa-times"></i> ยกเลิก </a>
		<?php if ($_REQUEST['op']=="edit"){
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;แก้ไขข้อมูล&nbsp;</button>";
		}elseif ($_REQUEST['op']=="del"){
			echo "<input type='hidden' name='op' value='del'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-warning btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;ลบข้อมูล&nbsp;</button>";
		}else{
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;เพิ่มข้อมูล&nbsp;</button>";
		}
		?>
	</div>

</form>
</div>

<!---------  ปฏิทิน ------------->
<script>
        $(function() {
            $('.datepic').datepicker({
                changeMonth: true,
                changeYear: true,  
				showButtonPanel: true,			
                dateFormat: 'dd.mm.yy'
            });
        });
</script>
<!---------  ปฏิทิน ------------->

<!-- tooltip -->
<!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> -->
<script>
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});
</script>
<!-- tooltip -->

<script>
	function addUser(val){
		user.value = val;
	}
</script>


<!---------- Set User & Password  ----------->
<script>
function myUser(val,id) {  // ค่าที่จะ SET , ID Textbox  ที่จะรับค่า
  document.getElementById(id).value = val;
}
</script>
<!---------- Set User & Password  ----------->