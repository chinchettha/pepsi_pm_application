<?php
$count=1;
error_reporting( error_reporting() & ~E_NOTICE );
session_start();
include('include/connection.php');
include('include/function.php');
include('include/define.php');

ini_set('max_execution_time', 300); //300 seconds = 5 minutes
set_time_limit(300);

//echo $_SESSION['mem_id'];
//if ($_SESSION['mem_id']<'5') {
//    echo "<meta http-equiv='refresh' content='0;url=login.php'>" ;  
//    exit() ;
//}

$path_page = "pages/";
$module=(isset($_REQUEST['module'])) ? $_REQUEST['module'] : 'line_calendar';
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
       <!--- <link href="pages/css/dataTables.bootstrap4.min.css" rel="stylesheet" crossorigin="anonymous" /> --->
       <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/js/all.min.js" crossorigin="anonymous"></script> 
      <!----  <script src="pages/js/all.min.js" crossorigin="anonymous"></script> -->
      

       
     


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
        
        <!-- <script src="https://code.jquery.com/jquery-3.4.1.min.js" crossorigin="anonymous"></script> -->
        <!-- <script src="pages/js/jquery-3.4.1.min.js" crossorigin="anonymous"></script> -->
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script> 
       <!----- <script src="pages/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script> --->
        <script src="pages/js/scripts.js"></script>
        <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js" crossorigin="anonymous"></script> -->
        <script src="pages/js/Chart.min.js" crossorigin="anonymous"></script>
        <script src="pages/assets/demo/chart-area-demo.js"></script>
        <script src="pages/assets/demo/chart-bar-demo.js"></script>
         <script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js" crossorigin="anonymous"></script> 
        <!--<script src="pages/js/jquery.dataTables.min.js" crossorigin="anonymous"></script> -->
        <script src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script>
        <!--- <script src="pages/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script> -->
        <script src="pages/assets/demo/datatables-demo.js"></script>
        
	<!-- Latest compiled and minified JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>

<!-- (Optional) Latest compiled and minified JavaScript translation files -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/i18n/defaults-*.min.js"></script>
  



    </body>
</html>
