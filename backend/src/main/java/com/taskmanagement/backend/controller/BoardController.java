package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.BoardResponse;
import com.taskmanagement.backend.dto.TaskListResponse;
import com.taskmanagement.backend.service.BoardService;
import com.taskmanagement.backend.service.TaskListService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;
    private final TaskListService taskListService;

    public BoardController(BoardService boardService, TaskListService taskListService) {
        this.boardService = boardService;
        this.taskListService = taskListService;
    }

    @GetMapping
    public List<BoardResponse> getBoards() {
        return boardService.getAllBoards();
    }

    @GetMapping("/{id}")
    public BoardResponse getBoard(@PathVariable UUID id) {
        return boardService.getBoardById(id);
    }

    @GetMapping("/{id}/lists")
    public List<TaskListResponse> getBoardLists(@PathVariable UUID id) {
        boardService.getBoardById(id);
        return taskListService.getListsByBoardId(id);
    }
}
