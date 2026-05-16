<?php
@session_start(); //สั่งให้ session ทำงาน กำหนดให้อยู่บนสุด
//error_reporting(E_ALL);
//ini_set("display_errors", 0);
//error_reporting( error_reporting() & ~E_NOTICE );
//include('include/connection.php');
//include('include/function.php');

//$title_page = user;
$tbl = "tbworkcenter";
//$myfile = "login";



function mysqli_escape_mimic($inp) {
    if(is_array($inp))
        return array_map(__METHOD__, $inp);

    if(!empty($inp) && is_string($inp)) {
        return str_replace(array('\\', "\0", "\n", "\r", "'", '"', "\x1a"), array('\\\\', '\\0', '\\n', '\\r', "\\'", '\\"', '\\Z'), $inp);
    }

    return $inp;
} 

if(isset($_POST['bt_send']))
{
    $user = mysqli_escape_mimic($_POST['txt_user']); 
    $pass = mysqli_escape_mimic($_POST['txt_password']);
    //$pass = mysqli_escape_mimic(md5($_POST['txt_password']));
        //echo $user = mysql_escape_mimic((isset($_POST['txt_user'])) ? $_POST['txt_user'] : '');exit();
         //$pass = mysql_real_escape_string((isset($_POST['txt_password'])) ? $_POST['txt_password'] : '');
        
        //$encode = md5($_POST['txt_password']);
        //$link = connect_db();
        $strSQL = "SELECT * FROM $tbl WHERE idwkctr = '$user' AND pass = '$pass';";
        $query = mysqli_query($link, $strSQL);
        $result = mysqli_fetch_array($query);
        //echo "strSQL".$strSQL;

       if($result){
			$_SESSION['mem_id']=$result['idwkctr']; // ID
			$_SESSION['idwkctr']=$result['idwkctr']; // ID
            $_SESSION['username'] = $result['wkctr'];  // รหัสช่าง
            $_SESSION['wkctr'] = $result['wkctr'];  // รหัสช่าง
            $_SESSION['plnt'] = $result['plnt']; //รหัสสํานักงาน 7151 = เลยล์ ลำพูน

            $_SESSION['birthday'] = $result['wkctrdate'];  //วันเกิด
            $_SESSION['startwork'] = $result['startwork'];  //วันเริ่มทำงาน

            $_SESSION['titlewkctr'] = $result['titlewkctr'];  //คำนำนหน้าชื่อ
            $_SESSION['namewkctr'] = $result['namewkctr'];  //ชื่อ
            $_SESSION['surnamewkctr'] = $result['surnamewkctr'];  //สกุล
			//ชื่อภาษาไทย
            $_SESSION['fullname_th'] = $result['titlewkctr'].$result['namewkctr']."  ".$result['surnamewkctr'];  //สกุล
			//ชื่อภาษาอังกฤษ
            $_SESSION['fullname_eng'] = $result['titlewkctreng'].$result['namewkctreng']."  ".$result['surnamewkctreng'];  //สกุล

            $_SESSION['idwkctrgroup'] = $result['idwkctrgroup'];  //กลุ่มงาน
            $_SESSION['idwkctrtype'] = $result['idwkctrtype'];  // รหัสประเภท
            $_SESSION['idposition'] = $result['idposition'];	// รหัสตำแหน่ง
            $_SESSION['UserST'] = $result['userst'];  //รหัสสถานะการใช้งาน
            $_SESSION['imgMember'] = $result['imgmember'];  //ภาพประจำตัวพนักงาน

			// สิทธิ์ผู้ใช้งานระบบ
			if ($_SESSION['UserST']=="A"){
				$_SESSION['sysstatus'] ="ผู้ดูแลระบบ";
				$_SESSION['user_level'] = 1;	//ระดับสิทธื์ผู้ดูแลระบบ
			}elseif	($_SESSION['UserST']=="U"){
				$_SESSION['sysstatus']="ผู้ใช้งานทั่วไป";
			}elseif	($_SESSION['UserST']=="W"){
				$_SESSION['sysstatus'] ="ช่าง";
				$_SESSION['user_level'] = 2;	//ระดับสิทธิ์ช่าง
			}else{
				$_SESSION['sysstatus']="ผู้ใช้งานทั่วไป";
			}
	
			/*switch ($_SESSION['UserST']) {
				case "A":
					$_SESSION['UserST']="ผู้ดูแลระบบ";
					$_SESSION['user_level']  = 1;
					break;
				case "U":
					$_SESSION['UserST']="ผู้ใช้งานทั่วไป";
					break;
				case "W":
					$_SESSION['UserST']="ช่าง";
					$_SESSION['user_level']  = 2;
					break;
				case "":
					$_SESSION['UserST']="ผู้ใช้งานทั่วไป";
					break;
			}*/

			$uip=$_SERVER['REMOTE_ADDR']; // get the user ip
			$myip=getHostByName(getHostName());	//PHP >= 5.3.0
			
			/*
            $date = date("Y-m-d H:i:s");
            $strSQL2 = "UPDATE $tbl SET last_login='$date' WHERE idwkctr = ".$_SESSION['mem_id']." ";
            $query2 = mysqli_query($link, $strSQL2);
            //echo "OK".$strSQL2;
			*/

			$action="in";
			// query for inser user log in to data base

            $strSQL_log = "insert into tbworkcenter_userlog(userId,username,userIp,myIp,action) values('".$_SESSION['mem_id']."','".$_SESSION['username']."','$uip','$myip','$action')";
            $query_log = mysqli_query($link, $strSQL_log);
			// code redirect the page after login

			// ให้ไปหน้าเริ่มต้น
			//echo "<meta http-equiv='refresh' content='0;url=".$PHP_SELF."?module=info' />";
			echo "<meta http-equiv='refresh' content='0;url=index.php?module=M_plan_calendar' />";
            //header( "location:index.php?module=info" );

            exit(0);
        } 
        else 
        {  
            //echo "!NO!".$strSQL2;
			echo "<meta http-equiv='refresh' content='0;url=".$PHP_SELF."?module=login&c=nouser' />";
			//header( "location:login.php?c=nouser" );
           exit(0);  
        } 
}
?>

<div class="container-fluid">
	<h1 class="mt-4">เข้าสู่ระบบ</h1>
	<ol class="breadcrumb mb-4">
		<li class="breadcrumb-item"><a href="index.php">หน้าหลัก</a></li>
		<li class="breadcrumb-item active">ลงชื่อเข้าใช้</li>
	</ol>
	<!-- <div class="card mb-4">
		<div class="card-body">This page is an example of using the light side navigation option. By appending the <code>.sb-sidenav-light</code> class to the <code>.sb-sidenav</code> class, the side navigation will take on a light color scheme. The <code>.sb-sidenav-dark</code> is also available for a darker option.</div>
	</div> -->


                <main>
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-5">
                                <div class="card shadow-lg border-0 rounded-lg mt-0">
                                    <div class="card-header"><h3 class="text-center font-weight-light my-1">Login</h3></div>
                                    <div class="card-body">
										<?php
										if(@addslashes($_GET['c'])=='nouser'){
											echo '<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'."ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง !".'</div>';
										}
										?>

                                        <form role="form" action="<?php $PHP_SELF?>?module=login" method="post">
											<div class="input-group mb-3">
											  <div class="input-group-append">
												<div class="input-group-text">
												  <span class="fas fa-user"></span>
												</div>
											  </div>
											  <input type="text" name="txt_user" class="form-control" placeholder="ชื่อผู้ใช้" autofocus required>
											</div>
											<div class="input-group mb-3">
											  <div class="input-group-append">
												<div class="input-group-text">
												  <span class="fas fa-lock"></span>
												</div>
											  </div>
											  <input type="password" name="txt_password" class="form-control" placeholder="รหัสผ่าน" required>
											</div>

                                            <div class="form-group d-flex align-items-center justify-content-between mt-4 mb-0">
											<!-- <a class="small" href="password.html">Forgot Password?</a>
											<a class="btn btn-primary" href="index.html">Login</a> -->
											<button type="submit" class="btn btn-success btn-block" name="bt_send" id="bt_send">Sign In</button>
											</div>
                                        </form>
                                    </div>
                                    <div class="card-footer text-center">
                                        <!-- <div class="small"><a href="register.html">Need an account? Sign up!</a></div> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

</div>

