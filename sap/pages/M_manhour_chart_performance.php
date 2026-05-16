<?PHP 
session_start();

/********* 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/


// Include File connect Database
date_default_timezone_set("Asia/Bangkok");

  
if(!empty(isset($_REQUEST["Event"]))){  //หาว่าส่งค่า ตัวแปรวันที่มาหรือป่าว
    require_once('../include/connection.php');
    require_once('../include/define.php');

    $Events = $_REQUEST["Event"];
    $stdate = explode(".",$Events[0]);
    $day7 =  mktime(0,0,0,$stdate[1],$stdate[0],$stdate[2]);

    $endate = explode(".",$Events[1]);
    $dayNow =  mktime(0,0,0,$endate[1],$endate[0],$endate[2]);
  } else{
    $dayNow = mktime(0,0,0,date("m"),date("d"),date("Y"));
    $day7 = mktime(0,0,0,date("m"),date("d")-30,date("Y"));
  } //  end if หาว่าส่งค่า ตัวแปรวันที่มาหรือป่าว

//ค้นหาข้อมูลพนักงาน
$sqlMH = "SELECT * FROM  `view_workcenter`  where idwkctr = '".$_SESSION['mem_id']."'  ";
$queryMH = mysqli_query($link, $sqlMH) or die ("Error Query [".$sqlMH."]");
$numMH = mysqli_num_rows($queryMH);
if($numMH > 0){
    $rsMH = mysqli_fetch_array($queryMH);
}
//ปิดค้นหาข้อมูลพนักงาน

$SearchDay = "  between '$day7' and '$dayNow'" ;

?>


<div class="row col-sm-12 " > <div class="col-sm text-center" > <img src="img/TextPerformance.png" alt="">   </div></div>

<div class="row col-sm-12">
    <div class="col-sm-3"> 
    <div class="row" >
            <div class="col-sm text-center alert-dark" style="background-color: #000000;color:#ffffff;" > จำนวน Work order  ทั้งหมด </div>
        </div>
        <div class="row" >
            <div class="col-sm text-center  alert-secondary"  >
                <strong> 
            <!----------หาจำนวนงานที่ถูก Plan ---------->
             <?PHP  
             $sqlMH1 = " SELECT * FROM  view_planwork  where wkctr = '".$rsMH["wkctr"]."' and  bscstart " .$SearchDay. "  ";
             $queryMH1 = mysqli_query($link, $sqlMH1) or die ("Error Query [".$sqlMH1."]");
             $numMH1 = mysqli_num_rows($queryMH1);
             if($numMH1 > 0){
                echo $numMH1;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงานที่ถูก Plan ---------->
            </strong>
            </div>
        </div>
        <div class="row" >
            <div class="col=sm"> &nbsp; </div>
        </div>
      
        <div class="row" >
            <div class="col-sm text-center" style="background-color: #000000;color:#ffffff;" > %Utilization </div>
        </div>
        <div class="row" >
            <div class="col-sm text-center alert-secondary"> 
            <!----------- หา % Utilization ----------------->
            <?PHP  
                // sum Time Confirm
                $sqlUC = " SELECT sum(timewk) as TotalUC FROM  view_exportconfirm   where wkctr = '".$rsMH["wkctr"]."' and  endate " .$SearchDay. " ";
                $queryUC = mysqli_query($link, $sqlUC) or die ("Error Query [".$sqlUC."]");
                $numUC = mysqli_num_rows($queryUC);
                $rsUC = mysqli_fetch_array($queryUC);
                $TotalUC =  $rsUC["TotalUC"];
                if($TotalUC > 0){
                    $TUC =  $TotalUC;
                }else {
                    $TUC =  "0";
                } 
                // sum Time Confirm

                //sum manhour
                $sqlUM = " SELECT sum(wh) as Twh, sum(ot1) as Tot1 , sum(ot15) as Tot15 , sum(ot1hol) as Tot1hol , sum(ot2) as Tot2, sum(ot3) as Tot3
                            FROM  tbmanhours where idwkctr = '".$_SESSION['mem_id']."' and workday  " .$SearchDay. " ";
                $queryUM = mysqli_query($link, $sqlUM) or die ("Error Query [".$sqlUM."]");
                $numUM = mysqli_num_rows($queryUM);
                $rsUM = mysqli_fetch_array($queryUM);
                $TotalUM =  $rsUM["Twh"] + $rsUM["Tot1"] + $rsUM["Tot15"]+ $rsUM["Tot1hol"]+ $rsUM["Tot2"] + $rsUM["Tot3"]  ;
                if($TotalUM > 0){
                    $TUM = $TotalUM;
                }else{
                    $TUM = 0;
                }
                //sum manhour

                $UT = ($TUC / $TUM)*100;
                echo sprintf("%.2f", $UT) ."%";

            ?>
             <!----------- หา % Utilization ----------------->
            </div>
        </div>
    </div>

    <div class="col-sm-1"> </div>          


    <div class="col-sm text-center ">
    <?PHP 
    if(!empty($rsMH["imgmember"])){
        $imgMember = $rsMH["imgmember"] ;
    }else {
        $imgMember = "Performance.png";
    }
    ?>
    <img src="imgMember/<?PHP echo $imgMember ;?>"  title="<?PHP echo $rsMH["titlewkctr"].$rsMH["namewkctr"] ."  ". $rsMH["surnamewkctr"]  ;  ?>" data-toggle="tooltip" data-html="true" width="250px" >
    </div>

    <div class="col-sm-1"> </div>   

    <div class="col-sm">
        <div class="row" >
            <div class="col-sm text-center alert-success "  > ZB01 </div>
        </div>
        <div class="row" >
            <div class="col-sm text-center alert-secondary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ที่ได้รับมอบหมาย ---------->
             <?PHP  
             $sqlMH2 = " SELECT * FROM view_planwork   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB01' and  bscstart " .$SearchDay. " ";
             $queryMH2 = mysqli_query($link, $sqlMH2) or die ("Error Query [".$sqlMH2."]");
             $numMH2 = mysqli_num_rows($queryMH2);
             if($numMH2 > 0){
                echo $numMH2;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-primary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01 ที่ทำการ Confirm ---------->
             <?PHP  
             $sqlMH3 = " SELECT * FROM  view_exportconfirm   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB01' and  endate " .$SearchDay. " ";
             $queryMH3 = mysqli_query($link, $sqlMH3) or die ("Error Query [".$sqlMH3."]");
             $numMH3 = mysqli_num_rows($queryMH3);
             if($numMH3 > 0){
                echo $numMH3;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01   ที่ทำการ Confirm ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-secondary ">
            <strong> 
             <!------------หาเปอร์เซนต์  ZB01 ----------->
              <?PHP 
                $peZB01 =  ($numMH2/$numMH3) * 100;  
                echo sprintf("%.2f", $peZB01) ."%";
              ?>
             <!------------หาเปอร์เซนต์ ZB01----------->
             </strong>
            </div>
        </div>   

        <div class="row" >
            <div class="col=sm"> &nbsp; </div>
        </div>
        
        <div class="row" >
            <div class="col-sm text-center alert-success " > ZB02 </div>
        </div>
        <div class="row" >
        <div class="col-sm text-center alert-secondary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ที่ได้รับมอบหมาย ---------->
             <?PHP  
             $sqlMH22 = " SELECT * FROM view_planwork   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB02' and  bscstart  " .$SearchDay. " ";
             $queryMH22 = mysqli_query($link, $sqlMH22) or die ("Error Query [".$sqlMH22."]");
             $numMH22 = mysqli_num_rows($queryMH22);
             if($numMH22 > 0){
                echo $numMH22;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-primary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01 ที่ทำการ Confirm ---------->
             <?PHP  
             $sqlMH32 = " SELECT * FROM  view_exportconfirm   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB02'  and  endate  " .$SearchDay. " ";
             $queryMH32 = mysqli_query($link, $sqlMH32) or die ("Error Query [".$sqlMH32."]");
             $numMH32 = mysqli_num_rows($queryMH32);
             if($numMH32 > 0){
                echo $numMH32;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01   ที่ทำการ Confirm ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-secondary ">
            <strong> 
             <!------------หาเปอร์เซนต์  ZB01 ----------->
              <?PHP 
                $peZB02 =  ($numMH22/$numMH32) * 100;  
                echo sprintf("%.2f", $peZB02) ."%";
              ?>
             <!------------หาเปอร์เซนต์ ZB01----------->
             </strong>
            </div>
        </div>    

        <div class="row" >
            <div class="col=sm"> &nbsp; </div>
        </div>
        
        <div class="row" >
            <div class="col-sm text-center alert-success " > ZB05 </div>
        </div>
        <div class="row" >
        <div class="col-sm text-center alert-secondary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ที่ได้รับมอบหมาย ---------->
             <?PHP  
             $sqlMH23 = " SELECT * FROM view_planwork   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB05'  and  bscstart  " .$SearchDay. " ";
             $queryMH23 = mysqli_query($link, $sqlMH23) or die ("Error Query [".$sqlMH23."]");
             $numMH23 = mysqli_num_rows($queryMH23);
             if($numMH23 > 0){
                echo $numMH23;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01  ทั้งหมด ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-primary ">
            <strong> 
            <!----------หาจำนวนงาน ZB01 ที่ทำการ Confirm ---------->
             <?PHP  
             $sqlMH33 = " SELECT * FROM  view_exportconfirm   where wkctr = '".$rsMH["wkctr"]."' and wktype = 'ZB05'  and  endate  " .$SearchDay. " ";
             $queryMH33 = mysqli_query($link, $sqlMH33) or die ("Error Query [".$sqlMH33."]");
             $numMH33 = mysqli_num_rows($queryMH33);
             if($numMH33 > 0){
                echo $numMH33;
             }else {
                 echo "0";
             }             
             ?>
            <!----------หาจำนวนงาน ZB01   ที่ทำการ Confirm ---------->
            </strong>
            </div>
            <div class="col-sm text-center alert-secondary ">
            <strong> 
             <!------------หาเปอร์เซนต์  ZB01 ----------->
              <?PHP 
                $peZB05 =  ($numMH23/$numMH33) * 100;  
                echo sprintf("%.2f", $peZB05) ."%";
              ?>
             <!------------หาเปอร์เซนต์ ZB01----------->
             </strong>
            </div>
        </div>    
        </div>    

    </div>

</div>

</div>

<?PHP
if(empty(isset($_REQUEST["Event"]))){  //หาว่าส่งค่า ตัวแปรวันที่มาหรือป่าว
?>
<div class="row col-sm">
    <div class="col-sm"> </div>
    <div class="col-sm text-center " style="background-color: #000000;color:#ffffff;" > 
        <?PHP echo  $rsMH["wkctr"]."  ". $rsMH["titlewkctr"].$rsMH["namewkctr"] ."  ". $rsMH["surnamewkctr"]  ;  ?> <br>
        <?PHP echo $rsMH["wkctrtype"] ." - ". $rsMH["position"]  ;  ?>
    </div>
    <div class="col-sm"> </div>
</div>
<?PHP 
}
?>

