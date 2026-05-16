<div class="input-group mb-3">
      		<div class=" input-group-prepend ">
        		<span class="btn btn-info "  style="width: 180px; text-align: right;" >Work Order / opac</span>
      		</div>
      			<input type="text" class="form-control " placeholder="-" id="workorder" name="workorder"  value="<?PHP echo $row["wkorder"] ?> / <?PHP echo $row["opac"] ?>"  readonly>
    	</div>

		<div class="input-group mb-3">
      		<div class="input-group-prepend">
        		<span class="btn btn-info" style="width: 180px; text-align: right;">Maintenance plan</span>
      		</div>
      		<input type="text" class="form-control" placeholder="-" id="mntplan" name="mntplan" value="<?PHP echo $row["mntplan"] ?>" readonly>
    	</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Type / Status </span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="typework" name="typework" value="<?PHP echo $row["wktype"] ?> / <?PHP echo $row["syst"] ?> " readonly>
					</div>
					
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Resources </span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="sysstatus" name="workorder" value="<?PHP echo  $row["wkctr"] .' / '.ShowResources($row["wkctr"]) ?>  " readonly>
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Work / Action </span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="sysstatus" name="workorder" value="<?PHP echo $row["work"] ?> / <?PHP echo $row["actwork"] ?>  <?PHP echo $row["untime"] ?>  " readonly>
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Equipment Desc.</span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="Resources" name="Resources" value="<?PHP echo $row["equdescrip"] ?>" readonly>
    				</div>	

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Functional Desc.</span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="functlocescrdip" name="functlocescrdip" value="<?PHP echo $row["funcdescrip"] ?>" readonly>
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">Plan / finish date </span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="bscstart" name="bscstart" value="<?PHP echo $PlanDate .' / '. $ActionDate ; ?>" readonly>
					</div>
					
					<!---------********************************** ย้าย Move Plane ***************************** -------->
					<?PHP 
					if($_SESSION['UserST'] == "A" || $_SESSION['UserST'] == "H"  ){ //เช็คสิทธิ์การย้าย
				
						if(trim($row["syst"]) == "REL" || trim($row["syst"]) == "CRTD"  ){ //เช็คสถานะ เฉพาะ REL กับ CRT
						
					?>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;"> New Plan  </span>
						  </div>
						  <!------
						  <input type="text" class="form-control" placeholder="-" id="Movedto" name="Movedto" value="<?PHP echo $ChangeDate  ; ?> " readonly>
						  เลือกวันที่ย้าย 
						  <span class="btn btn-info" style="text-align: right;">Moved</span>
						  --->
						  <select class="form-control" placeholder="Day" id="MoveD" name="MoveD"  style="width: 50px;" >
						  <?PHP 
						 	for($dd=1;$dd<=31;$dd++){
								if($dd==$Cd){
									echo "<option value='$dd' selected > " .sprintf("%02d", $dd) ."</option>";
								}else{
									echo "<option value='$dd' >" .sprintf("%02d", $dd) ."</option>";
								}								
							 } 
						  ?>						  
						  </select>
						  <select class="form-control" placeholder="Month" id="MoveM" name="MoveM"  >
						  <?PHP 
						 	for($mm=1;$mm<=12;$mm++){
								if($mm == $Cm){
									echo "<option value='$mm' selected >" .sprintf("%02d", $mm) ."</option>";
								}else {
									echo "<option value='$mm' >" .sprintf("%02d", $mm) ."</option>";
								}								
							 } 
						  ?>						  
						  </select>
						  <select class="form-control" placeholder="Month" id="MoveY" name="MoveY"  >
						  <?PHP 
						  	$y = date("Y")+1;
						 	for($yy=2018;$yy<=$y;$yy++){
								if($yy == $Cy){
									echo "<option  value='$yy' selected >$yy</option>";
								}else{
									echo "<option value='$yy' >$yy</option>";
								}	//end if($yy = $y){							
							 } //end for($yy=2018;$yy<=$y+1;$yy++)
						  ?>						  
						  </select>
						  <!------ เลือกวันที่ย้าย --->
						  <button type="button" id="savePlan" class="btn btn-danger" onclick="return newPlan('<?PHP echo $idiw37;?>',MoveD.value+'.'+MoveM.value+'.'+MoveY.value)" > Moved </button>
					</div>
					<?PHP  
							} // if(trim($row["syst"]) == "REL" || trim($row["syst"]) == "CRTD"  ){ //เช็คสถานะ เฉพาะ REL กับ CRT
						} // if($_SESSION['UserST'] == "A" || $_SESSION['UserST'] == "H" || $_SESSION['UserST'] == "W" )								
					?>
					<!---------********************************** ย้าย Move Plane ***************************** -------->

					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info " style="width: 180px; text-align: right;">Reason / Moved</span>
      					</div>
      					<input type="text" class="form-control" placeholder="-" id="Reason" name="Reason" value="<?PHP echo $row['reasoncode'] .'='.$row["reasonname"] .' / '. $MoveCount .' โดย '. ShowResources($row["mwkctr"]) ;  ?>" readonly>
    				</div>											
