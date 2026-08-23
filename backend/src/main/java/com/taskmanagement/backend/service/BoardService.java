package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.BoardResponse;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.repository.BoardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public List<BoardResponse> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(BoardResponse::from)
                .toList();
    }

    public BoardResponse getBoardById(UUID id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found: " + id));
        return BoardResponse.from(board);
    }
}
