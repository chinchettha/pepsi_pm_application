<?php
error_reporting(E_ALL);
ini_set("display_errors", 0);
@session_start(); //สั่งให้ session ทำงาน กำหนดให้อยู่บนสุด
//error_reporting( error_reporting() & ~E_NOTICE );
//include('include/connection.php');
//include('include/function.php');
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
    //$pass = mysqli_escape_mimic(md5($_POST['txt_password']));
    $pass = mysqli_escape_mimic($_POST['txt_password']);
        //echo $user = mysql_escape_mimic((isset($_POST['txt_user'])) ? $_POST['txt_user'] : '');exit();
         //$pass = mysql_real_escape_string((isset($_POST['txt_password'])) ? $_POST['txt_password'] : '');
        
        //$encode = md5($_POST['txt_password']);
        //$link = connect_db();
        $strSQL = "SELECT * FROM tbl_member WHERE username = '$user' AND password = '$pass';";
        $query = mysqli_query($link, $strSQL);
        $result = mysqli_fetch_array($query);
        //echo "strSQL".$strSQL;

       if($result){
			$_SESSION['login']=$result['username']; // hold the user name in session
            $_SESSION['mem_id'] = $result['id'];
            $_SESSION['idcard']  = $result['idcard'];
            $_SESSION['username']  = $result['username'];
            //$_SESSION['user_level']  = $result['level'];
            $_SESSION['user_level']  = 2;
            $_SESSION['status']  = $result['status'];
            $_SESSION['fullname'] = $result['fullname'];
            $_SESSION['bank'] = $result['bank'];
            $_SESSION['bank_no'] = $result['bank_no'];
            $_SESSION['branch'] = $result['branch'];

            //$_SESSION['position'] = $result['position'];

			$uip=$_SERVER['REMOTE_ADDR']; // get the user ip
			$myip=getHostByName(getHostName());	//PHP >= 5.3.0

            $date = date("Y-m-d H:i:s");
            $strSQL2 = "UPDATE tbl_member SET last_login='$date' WHERE id = ".$_SESSION['mem_id']." ";
            $query2 = mysqli_query($link, $strSQL2);
            //echo "OK".$strSQL2;

			$action="Login";
			// query for inser user log in to data base

            $strSQL_log = "insert into tbl_system_userlog(userId,username,userIp,myIp,action) values('".$_SESSION['mem_id']."','".$_SESSION['username']."','$uip','$myip','$action')";
            $query_log = mysqli_query($link, $strSQL_log);
			// code redirect the page after login

			echo "<meta http-equiv='refresh' content='0;url=".$PHP_SELF."?module=info' />";
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
<!-- Essential javascripts for application to work sweetalert2 -->
<link rel="stylesheet" href="sweetalert2/sweetalert2.min.css">
<script src="sweetalert2/sweetalert2.min.js"></script>
<script src="sweetalert2/jquery.min.js"></script>
<script src="sweetalert2/custom.js"></script>
<!-- END Essential javascripts for application to work sweetalert2 -->

	<!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0 text-dark">เข้าสู่ระบบ</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="index.php">หน้าหลัก</a></li>
              <li class="breadcrumb-item active">ลงชื่อเข้าใช้</li>
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

<center>
<!-- <body class="hold-transition login-page"> -->
<div class="login-box">
  <div class="login-logo">
    <a href="#"><b>LOGIN | </b>ล็อกอิน</a>
  </div>
  <!-- /.login-logo -->
  <div class="card">
    <div class="card-body login-card-body">
      <p class="login-box-msg">Sign in to start your session</p>

		<?php
		if(@addslashes($_GET['c'])=='nouser'){
			echo '<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'."ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง !".'</div>';
		}
		?>

      <form role="form" action="<?php $PHP_SELF?>?module=login" method="post">
        <div class="input-group mb-3">
          <!-- <input type="email" class="form-control" placeholder="Email"> -->
          <input type="text" name="txt_user" class="form-control" placeholder="ชื่อผู้ใช้" autofocus required>
          <div class="input-group-append">
            <div class="input-group-text">
              <span class="fas fa-user"></span>
            </div>
          </div>
        </div>
        <div class="input-group mb-3">
          <input type="password" name="txt_password" class="form-control" placeholder="รหัสผ่าน" required>
          <div class="input-group-append">
            <div class="input-group-text">
              <span class="fas fa-lock"></span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-8">
            <div class="icheck-primary">
              <input type="checkbox" id="remember">
              <label for="remember">
                Remember Me
              </label>
            </div>
          </div>
          <!-- /.col -->
          <div class="col-4">
            <!-- <button type="reset" class="btn btn-info btn-block">Reset</button> -->
            <button type="submit" class="btn btn-success btn-block" name="bt_send" id="bt_send">Sign In</button>
          </div>
          <!-- /.col -->
        </div>
      </form>

      <!-- <div class="social-auth-links text-center mb-3">
        <p>- OR -</p>
        <a href="#" class="btn btn-block btn-primary">
          <i class="fab fa-facebook mr-2"></i> Sign in using Facebook
        </a>
        <a href="#" class="btn btn-block btn-danger">
          <i class="fab fa-google-plus mr-2"></i> Sign in using Google+
        </a>
      </div> -->
      <!-- /.social-auth-links -->
	  <!-- <hr>
      <p class="mb-1">
        <a href="<?php $PHP_SELF ?>?module=forgot-password">I forgot my password</a>
      </p>
      <p class="mb-0">
        <a href="<?php $PHP_SELF ?>?module=register" class="text-center">Register a new membership</a>
      </p> -->
    </div>
    <!-- /.login-card-body -->
  </div>
</div>
<!-- /.login-box -->
</center>
&nbsp;

<script type="text/javascript">
	// Login Page Flipbox control
	$('.login-content [data-toggle="flip"]').click(function () {
		$('.login-box').toggleClass('flipped');
		return false;
		});

	  var msg = 'กรุณาเข้าสู่ระบบ!';
  showBox(msg, 'error');

</script>

<!-- <script type="text/javascript">
	// Login Page Flipbox control
	$('.login-content [data-toggle="flip"]').click(function () {
		$('.login-box').toggleClass('flipped');
		return false;
});

	  var msg = 'ชื่อผู้ใช้หรือรหัสผ่านผิด!';
  showBox(msg, 'error');

</script> -->
