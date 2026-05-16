<?php
include('../include/connection.php');
$strSQL = "SELECT * FROM tbl_member where id ='".$_GET['memid']."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query)
?>
<div id="app" class="">
	<form role="form" id="modalForm">
		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<!-- <span v-if="item.id == 0">แก้ไข</span> -->
				<span v-else>แก้ไข : <?php echo $result['fullname'];?></span>				
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">
			<form>
				<input type="hidden" name="id" value="0" />
				<div class="form-group">
					<label for="idcard">
						<span class="text-secondary">เลขบัตรประจำตัวประชาชน*</span>
					</label>
					<input type="text" name="idcard" value="<?php echo $result['idcard'];?>" v-model="item.idcard" class="form-control" autocomplete="off" />
				</div>
				<div class="form-group">
					<label for="fullname">
						<span class="text-secondary">ชื่อ-นามสกุล*</span>
					</label>
					<input type="text" name="fullname" value="<?php echo $result['fullname'];?>" v-model="item.fullname" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="username">
						<span class="text-secondary">ชื่อผู้ใช้งาน*</span>
					</label>
					<input type="text" name="username" value="<?php echo $result['username'];?>" v-model="item.username" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="password">
						<span class="text-secondary" v-if="item.id == 0">รหัสผ่าน*</span>
						<span v-else>รหัสผ่าน</span>
					</label>
					<input type="password" name="password" value="" id="password" v-model="item.password" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="confpassword">
						<span class="text-secondary" v-if="item.id == 0">ยืนยันรหัสผ่าน*</span>
						<span v-else>ยืนยันรหัสผ่าน</span>
					</label>
					<input type="password" name="confpassword" value="" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="usertype">
						<span class="text-secondary">ประเภทผู้ใช้งาน*</span>
					</label>
					<select name="usertype" v-model="item.usertype" class="form-control">
						<option value="" selected="selected">สมาชิก</option>
						<!-- <option value="ADMIN">Admin</option>
						<option value="USER">User</option> -->
					</select>
				</div>
				<div class="form-group">
					<!-- <label><input type="checkbox">สถานะ</label> -->
					<div class="icheck-primary">
					  <input type="checkbox" id="remember">
					  <label for="remember">
						สถานะ
					  </label>
					</div>
				</div>
			</form>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-secondary" data-dismiss="modal">				ปิด</button>
			<button type="button" v-on:click.prevent="submitData()" class="btn btn-primary btn-save">
			บันทึก</button>
		</div>
	</form>
</div>

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