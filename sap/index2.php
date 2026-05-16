<?php
$count=1;
error_reporting( error_reporting() & ~E_NOTICE );
session_start();
require_once('include/connection.php');
require_once('include/function.php');
require_once('include/define.php');
//เรียก function คำนวณอายุ
include_once('include/function_calc_birthday.php');

ini_set('max_execution_time', 300); //300 seconds = 5 minutes
set_time_limit(300);

//echo $_SESSION['mem_id'];
//if ($_SESSION['mem_id']<'5') {
//    echo "<meta http-equiv='refresh' content='0;url=login.php'>" ;  
//    exit() ;
//}

$path_page = "pages/";
$module=(isset($_REQUEST['module'])) ? $_REQUEST['module'] : 'content';
$file_load=$module.".php";
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="" />
        <meta name="author" content="" />
        <title><?=SYS;?></title>
	    <!-- Favicons -->
	    <link href="img/lays-logo.png" rel="icon">
	    <link href="img/lays-logo.png" rel="apple-touch-icon">

        <link href="pages/css/styles.css" rel="stylesheet" />
         <link href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" rel="stylesheet" crossorigin="anonymous" />
         <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/js/all.min.js" crossorigin="anonymous"></script>  
         <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">  
       
        <!--  <link href="pages/css/dataTables.bootstrap4.min.css" rel="stylesheet" crossorigin="anonymous" />
            <script src="pages/js/all.min.js" crossorigin="anonymous"></script>
         -->
        


  <!--   
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
--->
<script src="pages/js/jquery-3.4.1.min.js" crossorigin="anonymous"></script>

<!-- SweetAlert2 css -->
<!-- This is what you need -->
<!-- <script src="//code.jquery.com/jquery-2.1.1.js"></script>  .......................-->
<script src="plugins/sweetalert/dist/sweetalert.js"></script>
<link rel="stylesheet" href="plugins/sweetalert/dist/sweetalert.css">
<link rel="stylesheet" href="js/bootstrap-select.css">


<!-- Count %  --->
<link href="plugins/pace/pace-theme-big-counter.css" rel="stylesheet" />

<!-- ///////////// -->
	<!-- END CSS for this page -->
	<script>
		//var gUrl = 'https://www.bahtsoft.com/demo_eqborrow/';
		var gUrl = '<?php $PHP_SELF ?>';
		var gModal = false;
		var gClass = 'member';
		var gEdit = 'แก้ไข';
		var gDelete = 'ลบ';
		var gPrint = 'พิมพ์';
		//var gApiKey = 'eefa66a9026e432ea2fd5405ac81075fe000769e';
	</script>
	<!-- END CSS for this page -->

    </head>
    <body class="sb-nav-fixed">

        <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
			<?php include('pages/navbar.php');?>
        </nav>

        <div id="layoutSidenav">
            <div id="layoutSidenav_nav">
                <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
					<?php include('pages/left_menu.php');?>
                </nav>
            </div>

            <div id="layoutSidenav_content">
                <main>
					<!-- Content Header (Page header) -->
					<?php include($path_page.$file_load);?> 
					<!-- /.content -->
                </main>

				
				<footer class="py-4 bg-light mt-auto">
					<?php include('pages/footer.php');?>
                </footer>

            </div>
        </div>


        <script src="https://code.jquery.com/jquery-3.4.1.min.js" crossorigin="anonymous"></script>
        <!-- <script src="pages/js/jquery-3.4.1.min.js" crossorigin="anonymous"></script> -->
        
        <!---------ปฏิทิน--------->
        <script src="./js/jquery-ui.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        <!-- <script src="pages/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script> -->
        
        <script src="pages/js/scripts.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js" crossorigin="anonymous"></script>
        <!-- <script src="pages/js/Chart.min.js" crossorigin="anonymous"></script> -->
        
        <script src="pages/assets/demo/chart-area-demo.js"></script>
        <script src="pages/assets/demo/chart-bar-demo.js"></script>
        <script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script>
        <!-- <script src="pages/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script>
        <script src="pages/js/jquery.dataTables.min.js" crossorigin="anonymous"></script>
        <script src="js/bootstrap-select.js"></script>
         -->
         
    
        <!-- Latest compiled and minified JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>

<!-- (Optional) Latest compiled and minified JavaScript translation files -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/i18n/defaults-*.min.js"></script>
        
        <script src="pages/assets/demo/datatables-demo.js"></script>
       


<!-- <script src="assets/js/custom.js"></script> -->
<script src="assets/js/member.js"></script>	
<!-- ///////////// -->

<!-- BEGIN Java Script for this page For normal Modal Popup -->	
<script src="js/custom.js"></script>
<!-- END Java Script for this page -->

<!-- Count %  -->
<script src="plugins/pace/pace.js"></script>




 

<!-- ///////////// -->
<!-- tooltip -->
<!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> -->
<script>
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});
</script>
<!-- tooltip -->

<?php
	//include('include/jquery_fileinput.php');
?>


    </body>
</html>
