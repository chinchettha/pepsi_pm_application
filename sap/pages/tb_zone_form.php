<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_zone.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

//$title_page = tb_workcentretype;
$tbl_policy = "tb_zone";
$myfile = "tb_zone";

$filed1 = "id_zone"; // id คีย์หลัก
$filed2 = "zone_name";
$filed3 = "zone_com";

include('../include/connection.php');
$strSQL = " SELECT * FROM $tbl_policy where $filed1 ='".$_REQUEST[$filed1]."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);

?>

<div id="app" class="">
	<!-- <form role="form" method="GET" >  -->
	<!-- <form role="form" method="GET" action="pages/tb_equipment_form_process.php"> -->
	<!-- <form role="form" method="GET" action="<?php $PHP_SELF ?>?module=tb_functional">  -->
	<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $tbl_policy;?>"> 

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

		<div class="modal-body">

				<div class="form-group">
					<label for="<?php echo $filed1;?>">
						<span class="text-secondary"><?php echo $filed1;?> *</span>
					</label>
					<input type="text" name="<?php echo $filed1;?>" value="<?php echo $result[$filed1];?>" v-model="item.<?php echo $filed1;?>" class="form-control" autocomplete="off" maxlength="" readonly/>
				</div>
				<div class="form-group">
					<label for="<?php echo $filed2;?>">
						<span class="text-secondary"><?php echo $filed2;?> *</span>
					</label>
					<input type="text" name="<?php echo $filed2;?>" value="<?php echo $result[$filed2];?>" v-model="item.<?php echo $filed2;?>" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="<?php echo $filed3;?>">
						<span class="text-secondary"><?php echo $filed3;?> *</span>
					</label>
					<input type="text" name="<?php echo $filed3;?>" value="<?php echo $result[$filed3];?>" v-model="item.<?php echo $filed3;?>" class="form-control" autocomplete="off"  />
				</div>

				<!-- <div class="form-group">
					<input type="hidden" name="op" value="save">
					<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button>
				</div> -->
		</div>

		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
			<!-- <input type="hidden" name="op" value="save"> -->
			<!-- <button type="submit" class="btn btn-success" name="submit"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button> -->
			<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
			<!-- <button type="submit" name="Submit" v-on:click.prevent="submitData()" class="btn btn-primary btn-save"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึก&nbsp;</button> -->
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

<!-- 
<script type="text/javascript">
var app = new Vue({
	el: '#app',
	data: {
		item: { id: $('input[name=id]').val(), usertype:'' }
	},
	methods: {
		submitData: function(){
			$('#modalForm').submit();
		}
	},
	created: function () {
		/* get data */
		axios.get(gUrl + 'api/users/' + this.item.id, {
			headers: {'api-key': gApiKey}
		}).then(
				response => {
					if (response.status === 200) {						
						if(this.item.id != 0){
							this.item = response.data;
						}
						this.item.is_active = (response.data.is_active == 1) ? true : false;
					}
				}
			);
	},
	mounted: function () {
		/* init iCheck */
		$('input').iCheck({
			checkboxClass: 'icheckbox_flat',
			radioClass: 'iradio_flat'
		});	

		var checkInterval = setInterval(function(){
			if(app.item.is_active || app.item.is_active == false){				
				if(app.item.is_active === true || app.item.id == 0){
					$('input').iCheck('check');
				}
				clearInterval(checkInterval);
			}
		},100);

		$('input').on('ifChecked', function (e) {
			app.item.is_active = true;
		});
		$('input').on('ifUnchecked', function (e) {
			app.item.is_active = false;
		});
		/* END init iCheck */
	}
});

</script>
 -->