
<?php
$title_page = "ข้อมูลส่วนตัว";
//$tbl_policy = "tbwkctrgroup";
//$myfile = "tbwkctrgroup";

//include('../include/connection.php');
$strSQL = "SELECT
tbworkcenter.*,
tbdepartment.department,
tbposition.position,
tbwkctrgroup.wkctrgroup,
tbwkctrgroup.wkctrdescription,
tbwkctrtype.wkctrtype
FROM
tbworkcenter
LEFT JOIN tbdepartment ON tbworkcenter.iddepartment = tbdepartment.iddepartment
LEFT JOIN tbposition ON tbworkcenter.idposition = tbposition.idposition
LEFT JOIN tbwkctrgroup ON tbworkcenter.idwkctrgroup = tbwkctrgroup.idwkctrgroup
LEFT JOIN tbwkctrtype ON tbworkcenter.idwkctrtype = tbwkctrtype.idwkctrtype
WHERE tbworkcenter.idwkctr='".$_REQUEST['id']."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
//echo $strSQL;
//echo "<br>startwork =".date("d-m-Y", $result['startwork'])."\n"; 
//echo "<br>startwork_th =".date("d-m-Y", $result['startwork'])."\n"; 

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

<div id="app" class="">
<!-- <form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>">  -->

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
		<div class="container h-100 py-2">
			<ul class="nav nav-tabs border-0" id="myTab" role="tablist">
				<li class="nav-item">
					<a class="nav-link active border border-primary border-bottom-0" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">ข้อมูลส่วนตัว</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-warning border-bottom-0" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">ข้อมูลงาน</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-danger border-bottom-0" id="messages-tab" data-toggle="tab" href="#messages" role="tab" aria-controls="messages" aria-selected="false">Messages</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-info border-bottom-0" id="settings-tab" data-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false">ชื่อผู้ใช้งาน&รหัสผ่าน</a>
				</li>
			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="home" role="tabpanel" aria-labelledby="home-tab">
				<?php
					//include('user_form_tab1.php');
				?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="profile" role="tabpanel" aria-labelledby="profile-tab">
				<?php
					include('user_form_tab2.php');
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-danger" id="messages" role="tabpanel" aria-labelledby="messages-tab">
				<?php
					//include('user_form_tab3.php');
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-info" id="settings" role="tabpanel" aria-labelledby="settings-tab">
				<?php
					include('user_form_tab4.php');
				?>			
				</div>
			</div>
		</div>
	<!-- </div> -->

	<!-- <div class="modal-footer">
		<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
		<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
		<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
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
	</div> -->

</form>
</div>

