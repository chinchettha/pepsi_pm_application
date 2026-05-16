<div class="sb-sidenav-menu">
	<div class="nav">

<?php
	//เมนูสำหรับ ผู้ดูแลระบบ
	if ($_SESSION['UserST']=="A" || $_SESSION['UserST']==""){
?>

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user"></i> &nbsp; USER</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Scheduling</a>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			BackLog Report</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=line_calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Line Scheduling</a>
	   

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user-secret"></i> &nbsp; ADMIN</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Scheduling</a>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			BackLog Report</a> 
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=workorder"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Order</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_confirmation"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Confirmation</a> 
			
		<!----------    for admin --------->    
		<div class="sb-sidenav-menu-heading"><i class="fas fa-tasks"></i> &nbsp; Main Menu</div>
		<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseLayouts" aria-expanded="false" aria-controls="collapseLayouts"
			><div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
			Import Data SAP
			<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
		<div class="collapse" id="collapseLayouts" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
			<nav class="sb-sidenav-menu-nested nav">
			 <!--<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"></i>&nbsp;Scheduling</a> -->
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_iw37n"></i>&nbsp;IW37N</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_tasklist"></i>&nbsp;PM Task List</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_lineschdul"></i>&nbsp;Line Scheduling</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_manhour"></i>&nbsp;Man Hour</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_equipment"></i>&nbsp;Equipment</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_functional"></i>&nbsp;Functional</a>									
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_lineproduct"></i>&nbsp;Line Product</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_zone"></i>&nbsp;Zone</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_machine"></i>&nbsp;Machine</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_activitytype"></i>&nbsp;Activity Type</a>									
			</nav>
		</div>

		<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#configsystem" aria-expanded="false" aria-controls="collapseLayouts"
			><div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
			Config System
			<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
		<div class="collapse" id="configsystem" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
			<nav class="sb-sidenav-menu-nested nav">
			 <!--<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"></i>&nbsp;Scheduling</a> -->
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_reason"></i>&nbsp;Reason</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_workstatus"></i>&nbsp;Work Status</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_worktype"></i>&nbsp;Work Type</a>   
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_zb"></i>&nbsp;Activity(ZB)</a>                                                                  								
			</nav>
		</div>
		
		

		<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#settingUser" aria-expanded="false" aria-controls="settingUser"
			><div class="sb-nav-link-icon"><i class="fa fa-users"></i></div>
			Personel
			<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
		<div class="collapse" id="settingUser" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
			<nav class="sb-sidenav-menu-nested nav">
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_personel">Personal</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_level">Lavel</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_department">Department</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_position">Position</a>		
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_Group">Group</a>						
			</nav>
		</div>

		<!----------    for admin --------->    


		 <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#report" aria-expanded="false" aria-controls="report"
			><div class="sb-nav-link-icon"><i class="fas fa-book-open"></i></div>
			Report
			<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
		<div class="collapse" id="report" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
			<nav class="sb-sidenav-menu-nested nav">
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_backlog">Back log Report</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_pm">PM Completion</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_peatime">Peatime Completion</a>
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_technician">Technician Utilitization</a>

				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_manhours_hr"
					><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
					Manhour HR</a>    
				<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_summary_weekly"
					><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
					Summary Weekly</a>    
			</nav>
		</div>


<?php
	//เมนูสำหรับ ช่าง
	}elseif ($_SESSION['UserST']=="W"){
?>

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user"></i> &nbsp; Menu</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Scheduling</a>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			BackLog Report</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=line_calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Line Scheduling</a>

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user-secret"></i> &nbsp; ช่าง</div>

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=workorder"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Order</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_planwork_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Confirmation</a> 

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_planwork_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			View Plan Work</a> 

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_worktime_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			View All Worktime</a> 
			
		<div class="sb-sidenav-menu-heading"><i class="fas fa-print"></i> &nbsp; รายงาน</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_manhours_hr"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Manhour HR</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_summary_weekly"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Summary Weekly</a> 

  
		<div class="sb-sidenav-menu-heading"><i class="fas fa-print"></i> &nbsp; รายงาน</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_manhours_hr"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Manhour HR</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_summary_weekly"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Summary Weekly</a>    

<?php
	//เมนูสำหรับ ผู้ใช้ทั่วไป
	}elseif ($_SESSION['UserST']=="U"){
?>

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user"></i> &nbsp; Menu</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Scheduling</a>
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			BackLog Report</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=line_calendar"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Line Scheduling</a>

		<div class="sb-sidenav-menu-heading"><i class="fas fa-user-secret"></i> &nbsp; ผู้ใช้งานทั่วไป</div>

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=workorder"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Work Order</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_planwork_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			Confirmation</a> 

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_planwork_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			View Plan Work</a> 

		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_worktime_view"
			><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
			View All Worktime</a>    

		<div class="sb-sidenav-menu-heading"><i class="fas fa-print"></i> &nbsp; รายงาน</div>
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_manhours_hr"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Manhour HR</a>    
		<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=W_summary_weekly"
			><div class="sb-nav-link-icon"><i class="fas fa-print"></i></div>
			Summary Weekly</a>    


<?php }// if ตรวจสอบสิทธิ์?>


	</div>
</div>

<div class="sb-sidenav-footer">
	<?php
	if ($_SESSION['username']==""){
	?>
	<div class="small"><a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=login"
	><i class="fas fa-lock"></i>&nbsp;เข้าสู่ระบบ</a></div>
	<?php }else{?>
	<div class="small">Logged in as : <?php echo $_SESSION['username'];?></div>
	<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=logout"
	><i class="fas fa-unlock" style="color:red"></i>&nbsp;ออกระบบ</a>
	<?php }?>
</div>