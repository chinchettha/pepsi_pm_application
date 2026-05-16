<?php
//เรียก function คำนวณอายุ
//include('include/function_calc_birthday.php');
// ตัวอย่างการใช้งาน
//$birthdate = strtotime( '1973-11-13' );
//$birthdate = strtotime( '06.06.1976' );

$birthdate = strtotime( date("d.m.Y", $_SESSION['birthday']) );
$startwork = strtotime( date("d.m.Y", $_SESSION['startwork']) );
$today = time();

/*
if (empty($birthdate)){
	echo '<br><strong>อายุการทำงาน : </strong>';
	echo timespan( $startwork , $today );
}else{
	echo '<strong>ปัจจุบันอายุ : </strong>';
	echo timespan( $birthdate , $today );
	echo '<br><strong>อายุการทำงาน : </strong>';
	echo timespan( $startwork , $today );
}
*/
?>


<?php
if (!empty($birthdate)){
?>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >ปัจจุบันอายุ </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" value="<?php echo timespan( $birthdate , $today );?>" READONLY>
	</div>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >อายุการทำงาน </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" value="<?php echo timespan( $startwork , $today );?>" READONLY>
	</div>

<?php
}else{
?>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >ปัจจุบันอายุ </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" value="" READONLY>
	</div>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >อายุการทำงาน </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" value="<?php echo timespan( $startwork , $today );?>" READONLY>
	</div>
<?php
}
?>
