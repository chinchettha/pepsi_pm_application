

<div id="app" class="">

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info "  style="width: 180px; text-align: right;" >รหัส HR</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" onkeyup="return myUser(this.value,'idwkctr_user')"  value="<?php echo $result['idwkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสพนักงาน"  >
    				</div>

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >คำนำหน้าชื่อ</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="titlewkctr" name="titlewkctr" value="<?php echo $result['titlewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="คำนำหน้าชื่อ">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ชื่อ</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="namewkctr" name="namewkctr" value="<?php echo $result['namewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ชื่อ">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">นามสกุล</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="surnamewkctr" name="surnamewkctr" value="<?php echo $result['surnamewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="นามสกุล">
    				</div>
					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >คำนำหน้าชื่อ eng</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="titlewkctreng" name="titlewkctreng" value="<?php echo $result['titlewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="คำนำหน้าชื่อ eng">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ชื่อ eng</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="namewkctreng" name="namewkctreng" value="<?php echo $result['namewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ชื่อ eng">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">นามสกุล eng</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="surnamewkctreng" name="surnamewkctreng" value="<?php echo $result['surnamewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="นามสกุล eng">
    				</div>


					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">วันเกิด</span>
						  </div>
						  <?PHP  
						 	if($result["wkctrdate"]){
								$birthday = date("d.m.Y", $result['wkctrdate']);
							 } else{
								 $birthday = "";
							 }// end if($result["wkctrdate"]){
						  ?>
						  <input type="text" class="form-control datepic"  id="wkctrdate" name="wkctrdate" value="<?php echo $birthday;?>" data-toggle="tooltip" data-html="true" data-placement="top" title="dd.mm.yyyy"  >						
    				</div>

                    <?PHP 
                    if(!empty($result["wkctrdate"])){
                        $birthdate = strtotime( date("d.m.Y", $result['wkctrdate']) );
                    }else{
                        $birthdate = "";
                    }
					
					$today = time();
					if (!empty($birthdate)){
					?>
						<div class="input-group mb-3">
							<div class=" input-group-prepend ">
								<span class="btn btn-info "  style="width: 180px; text-align: right;" >ปัจจุบันอายุ </span>
							</div>
							<input type="text" class="form-control " placeholder="" id="Show_old" name="Show_old" value="<?php echo timespan( $birthdate , $today );?>" READONLY>
						</div>
					<?php
					}else{
					?>
						<div class="input-group mb-3">
							<div class=" input-group-prepend ">
								<span class="btn btn-info "  style="width: 180px; text-align: right;" >ปัจจุบันอายุ </span>
							</div>
							<input type="text" class="form-control " placeholder="" id="Show_old" name="Show_old" value="" READONLY>
						</div>
					<?php
					}
					?>


					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">เบอร์โทรศัพท์</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="wkctrtel" name="wkctrtel" value="<?php echo $result['wkctrtel'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="เบอร์โทรศัพท์">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">อีเมล์</span>
      					</div>
      					<input type="email" class="form-control" placeholder="" id="wkctrmail" name="wkctrmail" value="<?php echo $result['wkctrmail'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="อีเมล์">
    				</div>

                    


				<!-- <div class="form-group">
					<input type="hidden" name="op" value="save">
					<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button>
				</div> -->


</div>





