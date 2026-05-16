<?PHP  


  if(!empty(isset($_REQUEST["Event"]))){  //หาว่าส่งค่า ตัวแปรวันที่มาหรือป่าว
    session_start();
  // Include File connect Database
  date_default_timezone_set("Asia/Bangkok");
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


  //หาจำนวน ชม การทำงานจาก HR
  $sqlMH = "SELECT * FROM  tbmanhours where idwkctr = '".$_SESSION['mem_id']."' and workday between '$day7' and '$dayNow' ";
  $queryMH = mysqli_query($link, $sqlMH) or die ("Error Query [".$sqlMH."]");
  $numMH = mysqli_num_rows($queryMH);
  $wh = 0;
  $ot1=0;
  $ot15 = 0;
  $ot1hol = 0;
  $ot2 = 0;
  $ot3 = 0;
  

  if($numMH > 0){
    while($rsMH = mysqli_fetch_array($queryMH)){
      $wh = $wh + $rsMH["wh"];
      $ot1 = $ot1 + $rsMH["ot1"];
      $ot15 = $ot15 + $rsMH["ot15"];
      $ot1hol = $ot1hol + $rsMH["ot1hol"];
      $ot2 = $ot2 + $rsMH["ot2"];
      $ot3 = $ot3 + $rsMH["ot3"];
    } 
    
  }
  //หาจำนวน ชม การทำงานจาก HR

  //หาจำนวน ชม จากการปิดงาน Confirm
  $sqlWH = "SELECT sum(timewk) as workhours FROM  view_confirmation where idwkctr = '".$_SESSION['mem_id']."' and  endate between '$day7' and '$dayNow' ";
  $queryWH = mysqli_query($link, $sqlWH) or die ("Error Query [".$sqlWH."]");
  $numWH = mysqli_num_rows($queryWH);
  
  if($numWH  >0){
    $rsWH = mysqli_fetch_array($queryWH);
    $whConfirm = $rsWH["workhours"] ;
  } else{
    $whConfirm = 0;
  }
  //หาจำนวน ชม จากการปิดงาน Confirm

?>


    <!------- <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>  --->
    <script type="text/javascript" src="assets/chart_google/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Week'],
          ['WH',     <?PHP  echo $wh;?>],
          ['OT1',      <?PHP  echo $ot1;?>],
          ['OT1.5',  <?PHP  echo $ot15;?>],
          ['OT1 HOL', <?PHP  echo $ot1hol;?>],
          ['OT2',    <?PHP  echo $ot2;?>],
          ['OT3',    <?PHP  echo $ot3;?>],
          ['Confirm Hours',  <?PHP  echo $whConfirm;?>  ]
        ]);

        var options = {
          title: 'ชั่วโมงการทำงาน เทียบระหว่าง HR และ Work Order ย้อนหลัง   ตั้งแต่วันที่  <?PHP  echo date("d.m.Y", $day7) ;?>  ถึง <?PHP  echo date("d.m.Y", $dayNow) ;?>  <?PHP  echo $whConfirm;?> '
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }
    </script>


    <div id="piechart" style="width: 1000px; height: 500px;"></div>

