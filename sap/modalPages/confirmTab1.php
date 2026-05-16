<div class="row">
        <div class="row col-9">
            <div class="col-2"> Work Order  </div>
            <div class="col"> <?PHP  echo $rsTB1["wkorder"];?>   </div>
        </div>
        <div class="row col-9">
            <div class="col-2">  <?PHP echo  date("d.m.Y");?>  </div>
            <div class="col"> 80004546 คณะกรรมการควบคุม  Orignal 0 page 1   </div>
        </div>
        <div class="col-3"> <img src="img/lays-logoX.png" width="24" class="img-thumbnail" alt="Cinque Terre"> </div>
    </div>
    <div class="row" > 
        <div  class="col-6"> Functional Location : <?PHP  echo $rsTB1["functionalloc"];?> </div>
        <div class="col-6"> Description : <?PHP  echo $rsTB1["funcdescrip"];?> </div>
    </div>
    <div class="row" > 
        <div  class="col-6"> Equipment  :  <?PHP  echo $rsTB1["equipment"];?> </div>
        <div class="col-6"> Description : <?PHP  echo $rsTB1["equdescrip"];?> </div>
    </div>
    <hr style="height:2px;border-width:1;">
    <div class="row"> 
        <div class="col-12"> Order Header Details </div>
    </div>
    <div class="row">
        <div class="col-6"> Work Centre : <?PHP  echo $rsTB1["wkctr"];?>  </div>
        <div class="col-6"> Priority :  </div>
    </div>
    <div class="row">
        <div class="col-6"> Start Date : <?PHP  if(!empty(trim($rsTB1["bscstart"]))){ echo  date("d.m.Y", $rsTB1["bscstart"]); }?> </div>
        <div class="col-6"> End Date : <?PHP   if(!empty(trim($rsTB1["actfinish"]))) { echo  date("d.m.Y", $rsTB1["actfinish"]); }?>  </div>
    </div>
    <div class="row">
        <div class="col-6"> Activity Type : <?PHP echo  sprintf("%03d", $rsTB1["mat"])  ;?>  - <?PHP  echo $rsTB1["matdescrip"];?>      </div>
        <div class="col-6"> Tech Id:  </div>
    </div>
    <hr style="height:2px;border-width:1;">
    <div class="row">
        <div class="col-6"> Deacription :      </div>
    </div>
    <div class="row">
        <div class="col-6"> No Permits Found    </div>
    </div>
    <hr style="height:2px;border-width:1;">
    <div class="row">
        <div class="col-6"> Header Short Text :  <?PHP echo $rsTB1["ostdescription"]  ;?>    </div>
    </div>
    <hr style="height:2px;border-width:1;">
    <div class="row">
        <div class="col-6"> Operation :  <?PHP echo  sprintf("%04d", $rsTB1["opac"])  ;?>    </div>
        <div class="col-6"> Work Centre :  <?PHP echo  $rsTB1["wkctr"];?>    </div>
    </div>
    <div class="row">
        <div class="col-6"> Operation Text :  <?PHP echo  $rsTB1["operationshorttext"]  ;?>    </div>
    </div>
    <div class="row">
        <div class="col-6"> Operation Long Text :     </div>
    </div>
    <div class="row">
        <div class="col-12"> 
            <?PHP
            //หา pm Task List
            $strTK = " SELECT * FROM  view_tarklist  where mntplan='". $rsTB1["mntplan"]."'  ";
	        $qrTK = mysqli_query($link, $strTK) or die ("Error Query [".$strTK."]");
            $totalRecords = mysqli_num_rows($qrTK);
            while($rsTK = mysqli_fetch_array($qrTK)){
                echo $rsTK["machinetl"]. "-". $rsTK["pmlist"]."/". sprintf("%02d",$rsTK["mat"])."=".$rsTK["matdescrip"] ."<br>"  ;
            }             
            //หา pm Task List
            ?>    
        </div>
    </div>
    <hr style="height:2px;border-width:1;">

