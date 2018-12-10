<html>
<head>
    <link rel="stylesheet" href="assets/app.min.css" type="text/css"/>
    <script src="assets/jquery.min.js" type="text/javascript"></script>
    <title>Game of Life</title>
</head>
<body>
<div class="page">
    <div class="page_header">
        <h1>Game of life</h1>
    </div>

    <div class="page_container">
        <?php
        print bvd_gol_generate_count_display();
        print bvd_gol_generate_canvas_display(20,20,650,650);
        ?>
    </div>
</div>
</body>

<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900" rel="stylesheet">
<script src="assets/app.min.js" type="text/javascript"></script>
</html>