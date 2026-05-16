<?php
require_once('../mpdf/mpdf.php');
/*
// Require composer autoload
require_once __DIR__ . '/vendor/autoload.php';

$defaultFontConfig = (new Mpdf\Config\FontVariables())->getDefaults();
$fontData = $defaultFontConfig['fontdata'];
$mpdf = new \Mpdf\Mpdf(['tempDir' => __DIR__ . '/tmp',
    'fontdata' => $fontData + [
            'sarabun' => [
                'R' => 'THSarabunNew.ttf',
                'I' => 'THSarabunNewItalic.ttf',
                'B' =>  'THSarabunNewBold.ttf',
                'BI' => "THSarabunNewBoldItalic.ttf",
            ]
        ],
]);
*/

ob_start(); // Start get HTML code
?>


<!DOCTYPE html>
<html>
<head>
<title>PDF</title>
<link href="https://fonts.googleapis.com/css?family=Sarabun&display=swap" rel="stylesheet">
<style>
body {
    font-family: sarabun;
}
table {
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
</head>
<body>

<h1>ตัวอย่างในการเก็บโค้ด HTML มาเป็น PDF</h1>
<table>
  <tr>
    <th>ชื่อ</th>
    <th>ที่อยู่</th>
    <th>ประเทศ</th>
  </tr>
  <tr>
    <td>น้องไก่ คนงาม</td>
    <td>นายบ้าน บ้าน</td>
    <td>ไทย</td>
  </tr>
  <tr>
    <td>นายรักเรียน</td>
    <td>Francisco Chang</td>
    <td>Mexico</td>
  </tr>
  <tr>
    <td>นายรักดี</td>
    <td>Roland Mendel</td>
    <td>Austria</td>
  </tr>
</table>

</body>
</html>



<?php
$html = ob_get_contents();
ob_end_clean();
echo $html ;
$name = date('Ydmhis') ;
//$name = "PRINT_STATIC_A".$_SESSION[smiss];
$pdf = new mPDF('th', 'A4', '0', 'THSaraban');
// Double-side document - mirror margins
//$pdf->mirrorMargins = 1;
//$pdf->shrink_tables_to_fit = 1;
$pdf->SetAutoFont();
$pdf->SetDisplayMode('fullpage');
//$pdf->SetHeader('{PAGENO}');
$pdf->SetFooter('{PAGENO}/{nbpg}');
$pdf->AddPage('P'); // เพิ่มหน้าใหม่แบบแนวตั้ง
//$pdf->AddPage('L'); // เพิ่มหน้าใหม่แบบแนวนอน
// Set a simple Footer including the page number
$pdf->WriteHTML($html, 2);
$pdf->Output("../MymPDF/$name.pdf");
?>     
<center><a href="../MymPDF/<?php echo $name?>.pdf" target="_blank">
<button type="button" class="btn btn-info" tabindex=""><span class="glyphicon glyphicon-print"></span> ดาวน์โหลดรายงานในรูปแบบ PDF คลิกที่นี่  >> พิมพ์สถิติ</button>
</a></center>

<style>
body {
  font-family: "THSaraban";
  /*font-size: 8pt;*/
}


/*
.container{
    font-family: "THSarabun";
    font-size: 14pt;
}
*/
</style>